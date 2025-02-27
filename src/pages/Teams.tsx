import React, { useState, useEffect } from "react";
import { Search, Users, Trophy, Trash2, Eye } from "lucide-react";
import { supabase } from "../lib/supabase"; // Adjust the path as necessary
import { Button } from "../components/ui/Button"; // Adjust the path as necessary
import { Dialog } from "../components/ui/Dialog"; // Adjust the path as necessary
import { RegistrationDetailsDialog } from "../components/ui/RegistrationDetailsDialog"; // Adjust the path as necessary
import { useToast } from "../hooks/useToast"; // Adjust the path as necessary

// Define the Registration interface
interface Registration {
  id: string;
  tournament_id: string;
  team_name: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  team_members: { name: string; username: string }[];
  contact_info: {
    full_name: string;
    email: string;
    phone: string;
    in_game_name: string;
    date_of_birth: string;
  };
  game_details: {
    platform: string;
    uid: string;
    device_model: string;
    region: string;
  };
  tournament_preferences: {
    format: string;
    mode: string;
    experience: boolean;
    previous_tournaments?: string;
  };
  tournaments: { title: string };
  logo_url?: string;
  tx_id?: string;
  payment_screenshot_path?: string;
}

// Define the Team interface
interface Team {
  id: string;
  name: string;
  logo_url: string;
  created_at: string;
  registration: Registration;
}

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false); // For deletion confirmation dialog
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const { success, error } = useToast(); // Destructure success and error directly

  const fetchTeams = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("registrations")
        .select(
          `
          id,
          team_name,
          logo_url,
          created_at,
          tournament_id,
          tournaments (
            title
          ),
          team_members,
          contact_info,
          game_details,
          tournament_preferences,
          status,
          tx_id,
          payment_screenshot_path
        `
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const formattedTeams: Team[] = (data || [])
        .map((registration: any) => {
          if (
            !registration.id ||
            !registration.team_name ||
            !registration.created_at ||
            !registration.status
          ) {
            console.error("Invalid registration data:", registration);
            return null;
          }

          let tournamentsData: { title: string } = { title: "" };
          if (registration.tournaments) {
            if (Array.isArray(registration.tournaments)) {
              tournamentsData = registration.tournaments[0] || { title: "" };
            } else {
              tournamentsData = registration.tournaments;
            }
          }

          const safeRegistration: Registration = {
            id: registration.id,
            tournament_id: registration.tournament_id || "",
            team_name: registration.team_name,
            status: registration.status as "pending" | "approved" | "rejected",
            created_at: registration.created_at,
            team_members: registration.team_members || [],
            contact_info: registration.contact_info || {
              full_name: "",
              email: "",
              phone: "",
              in_game_name: "",
              date_of_birth: "",
            },
            game_details: registration.game_details || {
              platform: "",
              uid: "",
              device_model: "",
              region: "",
            },
            tournament_preferences: registration.tournament_preferences || {
              format: "",
              mode: "",
              experience: false,
            },
            tournaments: tournamentsData,
            logo_url: registration.logo_url,
            tx_id: registration.tx_id,
            payment_screenshot_path: registration.payment_screenshot_path,
          };

          return {
            id: registration.id,
            name: registration.team_name,
            logo_url: registration.logo_url || "",
            created_at: registration.created_at,
            registration: safeRegistration,
          };
        })
        .filter((team): team is Team => team !== null);

      setTeams(formattedTeams);
    } catch (err) {
      console.error("Error fetching teams:", err);
      error("Failed to fetch teams"); // Use error directly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();

    const subscription = supabase
      .channel("teams_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "registrations",
          filter: "status=eq.approved",
        },
        () => fetchTeams()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [error, success]); // Add error and success to dependency array

  const handleViewDetails = (team: Team) => {
    setSelectedTeam(team);
    setIsDetailsOpen(true);
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeamToDelete(teamId);
    setIsDialogOpen(true);
  };

  const confirmDeleteTeam = async () => {
    if (!teamToDelete) return;

    setDeleteLoading(teamToDelete);
    setIsDialogOpen(false);

    try {
      const { data: registration, error: fetchError } = await supabase
        .from("registrations")
        .select("payment_screenshot_path")
        .eq("id", teamToDelete)
        .single();

      if (fetchError) throw fetchError;

      if (registration?.payment_screenshot_path) {
        const screenshotPath = registration.payment_screenshot_path;
        const { error: storageError } = await supabase.storage
          .from("payment-screenshots")
          .remove([screenshotPath]);

        if (storageError) {
          console.warn("Failed to delete payment screenshot:", storageError);
          error(
            "Failed to delete payment screenshot, but registration will be removed"
          );
        } else {
          console.log(
            "Payment screenshot deleted successfully:",
            screenshotPath
          );
        }
      }

      const { error: deleteError } = await supabase
        .from("registrations")
        .delete()
        .eq("id", teamToDelete);

      if (deleteError) throw deleteError;

      setTeams((prev) => prev.filter((team) => team.id !== teamToDelete));
      success("Team registration and payment screenshot deleted successfully");
    } catch (err) {
      console.error("Error deleting team:", err);
      error("Failed to delete team registration and associated data");
    } finally {
      setDeleteLoading(null);
      setTeamToDelete(null);
    }
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (team.registration.tournaments?.title &&
        team.registration.tournaments.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No teams found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No approved team registrations yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {team.logo_url ? (
                    <img
                      src={team.logo_url}
                      alt={`${team.name} Logo`}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://via.placeholder.com/64?text=No+Logo";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {team.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {team.registration.tournaments?.title}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    <span>
                      {team.registration.team_members?.length || 0} members
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleViewDetails(team)}
                    leftIcon={<Eye className="h-4 w-4" />}
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteTeam(team.id)}
                    leftIcon={<Trash2 className="h-4 w-4 text-red-600" />}
                    className="text-red-600 hover:text-red-900"
                    isLoading={deleteLoading === team.id}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RegistrationDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        registration={selectedTeam?.registration ?? null}
      />

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setTeamToDelete(null);
        }}
        title="Confirm Deletion"
        className="bg-white rounded-xl shadow-2xl max-w-md mx-auto p-6 border border-gray-200 backdrop-blur-md bg-opacity-90 transform transition-all duration-300 ease-in-out scale-95 hover:scale-100"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you sure you want to delete this team registration? This action
            cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => {
                setIsDialogOpen(false);
                setTeamToDelete(null);
              }}
              className="relative px-4 py-2 text-gray-700 bg-gray-100 rounded-lg shadow-md hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 ease-in-out border border-gray-300 group overflow-hidden"
            >
              <span className="relative z-10">Cancel</span>
              <span className="absolute inset-0 bg-gray-300 opacity-0 group-hover:opacity-30 transition-opacity duration-300 ease-in-out"></span>
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteTeam}
              isLoading={deleteLoading !== null}
              className="relative px-4 py-2 text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition-all duration-200 ease-in-out group overflow-hidden"
            >
              <span className="relative z-10">Delete</span>
              <span className="absolute inset-0 bg-red-800 opacity-0 group-hover:opacity-30 transition-opacity duration-300 ease-in-out"></span>
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Teams;
