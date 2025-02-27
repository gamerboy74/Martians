import { supabase } from "../lib/supabase";
import type { Tournament } from "../types";
import { RealtimeChannel } from "@supabase/supabase-js";

interface RegistrationCount {
  [key: string]: {
    approved: number;
    pending: number;
    total: number;
  };
}

export const tournamentService = {
  // Fetch all tournaments, ordered by creation date (descending)
  async fetchTournaments(): Promise<Tournament[]> {
    const { data, error } = await supabase
      .from("tournaments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to fetch tournaments: ${error.message}`);
    return data || [];
  },

  // Create a new tournament
  async createTournament(tournament: Omit<Tournament, "id" | "created_at" | "updated_at">): Promise<Tournament> {
    const { data, error } = await supabase
      .from("tournaments")
      .insert([{ ...tournament, current_participants: 0 }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create tournament: ${error.message}`);
    if (!data) throw new Error("Tournament creation failed: No data returned");
    return data;
  },

  // Update an existing tournament
  async updateTournament(id: string, tournament: Partial<Tournament>): Promise<Tournament> {
    try {
      const { data: existingTournament, error: fetchError } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (fetchError) throw new Error(`Failed to fetch tournament: ${fetchError.message}`);
      if (!existingTournament) throw new Error("Tournament not found");

      const { data, error: updateError } = await supabase
        .from("tournaments")
        .update({ ...tournament, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (updateError) throw new Error(`Failed to update tournament: ${updateError.message}`);
      if (!data) throw new Error("Tournament update failed: No data returned");
      return data;
    } catch (error) {
      console.error("Tournament update error:", error instanceof Error ? error.message : error);
      throw error;
    }
  },

  // Delete a tournament
  async deleteTournament(id: string): Promise<void> {
    const { error } = await supabase.from("tournaments").delete().eq("id", id);
    if (error) throw new Error(`Failed to delete tournament: ${error.message}`);
  },

  // Fetch a specific tournament by ID
  async getTournamentById(id: string): Promise<Tournament> {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw new Error(`Failed to fetch tournament: ${error.message}`);
      if (!data) throw new Error("Tournament not found");
      return data;
    } catch (error) {
      console.error("Error fetching tournament:", error instanceof Error ? error.message : error);
      throw error;
    }
  },

  // Update participant count for a tournament
  async updateParticipantCount(id: string): Promise<void> {
    try {
      const { data: registrations, error: countError } = await supabase
        .from("registrations")
        .select("id")
        .eq("tournament_id", id)
        .eq("status", "approved");

      if (countError) throw new Error(`Failed to count registrations: ${countError.message}`);

      const count = registrations?.length || 0;

      const { error: updateError } = await supabase
        .from("tournaments")
        .update({ current_participants: count })
        .eq("id", id);

      if (updateError) throw new Error(`Failed to update participant count: ${updateError.message}`);
    } catch (error) {
      console.error("Error updating participant count:", error instanceof Error ? error.message : error);
      throw error;
    }
  },

  // Fetch registration counts for all tournaments
  async fetchRegistrationCounts(): Promise<RegistrationCount> {
    const { data, error } = await supabase.from("registrations").select("tournament_id, status");

    if (error) throw new Error(`Failed to fetch registration counts: ${error.message}`);

    const counts: RegistrationCount = {};
    data.forEach((registration) => {
      if (!counts[registration.tournament_id]) {
        counts[registration.tournament_id] = { approved: 0, pending: 0, total: 0 };
      }
      counts[registration.tournament_id].total++;
      if (registration.status === "approved") counts[registration.tournament_id].approved++;
      else if (registration.status === "pending") counts[registration.tournament_id].pending++;
    });

    return counts;
  },

  // Subscribe to real-time changes for tournaments
  subscribeToTournaments(callback: () => void): RealtimeChannel {
    return supabase
      .channel("tournaments")
      .on("postgres_changes", { event: "*", schema: "public", table: "tournaments" }, callback)
      .subscribe();
  },

  // Subscribe to real-time changes for registrations
  subscribeToRegistrations(callback: () => void): RealtimeChannel {
    return supabase
      .channel("registrations_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, callback)
      .subscribe();
  },
};