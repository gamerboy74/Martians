import { supabase } from "../lib/supabase";
import { tournamentService } from "./tournamentService";
import type { RegistrationFormData } from "../types/registration";

export const registrationService = {
  async submitRegistration(data: RegistrationFormData, tournamentId: string) {
    console.log("Submitting registration:", { data, tournamentId });

    try {
      const { data: result, error } = await supabase
        .from("registrations")
        .insert({
          tournament_id: tournamentId,
          team_name: data.teamDetails.teamName,
          status: "pending",
          team_members: data.teamDetails.teamMembers,
          contact_info: {
            full_name: data.personalInfo.fullName,
            email: data.personalInfo.email,
            phone: data.personalInfo.contactNumber,
            in_game_name: data.personalInfo.inGameName,
            date_of_birth: data.personalInfo.dateOfBirth,
          },
          game_details: {
            platform: data.gameDetails.platform,
            uid: data.gameDetails.uid,
            device_model: data.gameDetails.deviceModel,
            region: data.gameDetails.region,
          },
          tournament_preferences: {
            format: data.tournamentDetails.format,
            mode: data.tournamentDetails.mode,
            experience: data.tournamentDetails.experience,
            previous_tournaments: data.tournamentDetails.previousTournaments,
          },
          logo_url: data.teamDetails.teamLogo,
        })
        .select("id, upload_token")
        .single();

      if (error) {
        console.error("Registration error:", error);
        throw new Error(error.message);
      }

      console.log("Registration submitted successfully:", result);
      return {
        registrationId: result.id,
        uploadToken: result.upload_token,
      };
    } catch (error) {
      console.error("Registration submission error:", error);
      throw error;
    }
  },

  async fetchRegistrations() {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select(`
          *,
          tournaments (
            title,
            game
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching registrations:", error);
      throw error;
    }
  },

  async updateRegistrationStatus(id: string, status: "approved" | "rejected") {
    try {
      const { data: registration, error: fetchError } = await supabase
        .from("registrations")
        .select("tournament_id")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from("registrations")
        .update({ status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      if (registration?.tournament_id) {
        await tournamentService.updateParticipantCount(registration.tournament_id);
      }

      return data;
    } catch (error) {
      console.error("Error updating registration status:", error);
      throw error;
    }
  },
};