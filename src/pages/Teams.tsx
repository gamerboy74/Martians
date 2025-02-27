import React, { useState, useEffect } from "react";
import { Search, Users, Trophy, Trash2, Eye } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import { RegistrationDetailsDialog } from "../components/ui/RegistrationDetailsDialog";
import { useToast } from "../hooks/useToast";

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
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const { success, error } = useToast();

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
      error("Failed to fetch teams");
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
  }, [error, success]);

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
          error("Failed to delete payment screenshot, but registration will be removed");
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
        team.registration.tournaments.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 bg-gradient-to-br from-white via-gray-50 to-gray-100 min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-b-4 border-purple-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-purple-700 opacity-60"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-purple-500/20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/50">
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-fade-in">
            Teams
          </h1>
          <div className="relative mt-3 sm:mt-0 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 placeholder:text-gray-400 transition-all duration-300 hover:shadow-lg"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform duration-300 hover:scale-110" />
          </div>
        </div>

        {/* No Teams */}
        {filteredTeams.length === 0 ? (
          <div className="text-center py-12 bg-white/90 rounded-xl shadow-lg border border-gray-200/50">
            <Users className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 animate-pulse" />
            <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">No teams found</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">No approved team registrations yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                className="bg-white/95 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200/50 transform hover:-translate-y-1"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4">
                    {team.logo_url ? (
                      <img
                        src={team.logo_url}
                        alt={`${team.name} Logo`}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200 hover:brightness-110 transition-all duration-300 shadow-sm"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/64?text=No+Logo";
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md animate-pulse-slow">
                        <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white transition-transform duration-300 hover:scale-110" />
                      </div>
                    )}
                    <div className="truncate">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{team.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{team.registration.tournaments?.title}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600 transition-transform duration-300 hover:scale-110" />
                      <span>{team.registration.team_members?.length || 0} members</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails(team)}
                      leftIcon={<Eye className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
                      className="group px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTeam(team.id)}
                      leftIcon={<Trash2 className="h-4 w-4 text-red-600 transition-transform duration-300 group-hover:scale-110" />}
                      className="group px-3 sm:px-4 py-1 sm:py-2 text-red-600 rounded-full shadow-md hover:bg-red-100 hover:text-red-900 transition-all duration-300"
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
          className="bg-white/95 rounded-xl shadow-2xl max-w-md mx-auto p-4 sm:p-6 border border-gray-200/50 backdrop-blur-md transform transition-all duration-300 ease-in-out scale-95 hover:scale-100"
        >
          <div className="space-y-4">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Are you sure you want to delete this team registration? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsDialogOpen(false);
                  setTeamToDelete(null);
                }}
                className="relative px-3 sm:px-4 py-1 sm:py-2 text-gray-700 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 hover:text-gray-900 transition-all duration-200 ease-in-out border border-gray-200 group overflow-hidden"
              >
                <span className="relative z-10 text-xs sm:text-sm">Cancel</span>
                <span className="absolute inset-0 bg-gray-300 opacity-0 group-hover:opacity-30 transition-opacity duration-300 ease-in-out"></span>
              </Button>
              <Button
                variant="danger"
                onClick={confirmDeleteTeam}
                isLoading={deleteLoading !== null}
                className="relative px-3 sm:px-4 py-1 sm:py-2 text-white bg-gradient-to-r from-red-600 to-pink-600 rounded-full shadow-md hover:from-red-700 hover:to-pink-700 hover:shadow-lg transition-all duration-200 ease-in-out group overflow-hidden"
              >
                <span className="relative z-10 text-xs sm:text-sm">Delete</span>
                <span className="absolute inset-0 bg-red-800 opacity-0 group-hover:opacity-30 transition-opacity duration-300 ease-in-out"></span>
              </Button>
            </div>
          </div>
        </Dialog>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-slow {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-in { animation: slide-in 0.5s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 2s infinite ease-in-out; }

        /* Responsive Adjustments for Small Devices */
        @media (max-width: 640px) {
          .space-y-6 > * + * {
            margin-top: 1rem;
          }
          .p-6 {
            padding: 0.75rem;
          }
          .text-3xl {
            font-size: 1.5rem;
          }
          .text-lg {
            font-size: 1rem;
          }
          .text-sm {
            font-size: 0.75rem;
          }
          .text-xs {
            font-size: 0.65rem;
          }
          .w-16 {
            width: 2.5rem;
            height: 2.5rem;
          }
          .h-12 {
            height: 2rem;
            width: 2rem;
          }
          .gap-6 {
            gap: 1rem;
          }
          .py-3 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          .w-64 {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Teams;