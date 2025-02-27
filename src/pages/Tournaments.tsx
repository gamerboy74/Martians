import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trophy, Calendar, Users, Plus, Search } from "lucide-react";
import { Dialog } from "../components/ui/Dialog";
import { TournamentForm } from "../components/ui/TournamentForm";
import { Button } from "../components/ui/Button";
import { useTournamentStore } from "../stores/tournamentStore";
import { useToast } from "../hooks/useToast";
import { formatDate } from "../lib/utils";
import { FaRupeeSign } from "react-icons/fa";
import { Tournament } from "../types";
import { tournamentService } from "../services/tournamentService";

interface RegistrationCount {
  [key: string]: {
    approved: number;
    pending: number;
    total: number;
  };
}

const Tournaments: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [registrationCounts, setRegistrationCounts] = useState<RegistrationCount>({});
  const { tournaments, loading, fetchTournaments, createTournament, subscribeToTournaments } = useTournamentStore();
  const [searchTerm, setSearchTerm] = useState("");
  const toast = useToast();

  const fetchRegistrationCounts = async () => {
    try {
      const counts = await tournamentService.fetchRegistrationCounts();
      setRegistrationCounts(counts);
    } catch (error) {
      console.error("Error fetching registration counts:", error);
    }
  };

  useEffect(() => {
    fetchTournaments();
    fetchRegistrationCounts();

    const unsubscribeTournaments = subscribeToTournaments();
    const subscription = tournamentService.subscribeToRegistrations(fetchRegistrationCounts);

    return () => {
      unsubscribeTournaments?.();
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, [fetchTournaments, subscribeToTournaments]);

  const handleCreateTournament = async (data: Omit<Tournament, "id" | "created_at" | "updated_at">) => {
    try {
      await createTournament({
        ...data,
        current_participants: 0,
        status: "upcoming" as const,
      });
      setIsDialogOpen(false);
      toast.success("Tournament created successfully");
    } catch (error) {
      toast.error("Failed to create tournament");
      console.error("Tournament creation error:", error);
    }
  };

  const filteredTournaments = tournaments.filter(
    (tournament) =>
      tournament.title.toLowerCase().includes(searchTerm.toLowerCase()) || tournament.game.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-fade-in">
            Tournaments
          </h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none w-full sm:w-64">
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 rounded-xl bg-white/95 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 placeholder:text-gray-400 transition-all duration-300 hover:shadow-lg"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform duration-300 hover:scale-110" />
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              leftIcon={<Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />}
              className="group w-full sm:w-auto px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
            >
              Add Tournament
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-b-4 border-purple-600"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-purple-700 opacity-60"></div>
              <div className="absolute inset-0 animate-pulse rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-purple-500/20"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 shadow-lg rounded-xl overflow-hidden border border-gray-200/50">
            <div className="overflow-x-auto">
              <div className="min-w-full p-4 sm:p-6 space-y-4 sm:space-y-6">
                {filteredTournaments.map((tournament) => (
                  <Link
                    key={tournament.id}
                    to={`/admin/tournaments/${tournament.id}`}
                    className="block bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 sm:p-6 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md animate-pulse-slow">
                          <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-300 hover:scale-110" />
                        </div>
                        <div className="truncate">
                          <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white truncate">{tournament.title}</h2>
                          <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 hover:scale-110" />
                              <span>{formatDate(tournament.start_date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 hover:scale-110" />
                              <span>
                                {registrationCounts[tournament.id]?.approved || 0}/{tournament.max_participants} (
                                {registrationCounts[tournament.id]?.pending || 0} pending)
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaRupeeSign className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 hover:scale-110" />
                              <span>Prize: {tournament.prize_pool}</span>
                            </div>
                            {tournament.registration_fee && (
                              <div className="flex items-center gap-1">
                                <FaRupeeSign className="h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-300 hover:scale-110" />
                                <span>Fee: {tournament.registration_fee}</span>
                              </div>
                            )}
                            {tournament.qr_code_url && (
                              <div className="flex items-center">
                                <img
                                  src={tournament.qr_code_url}
                                  alt="QR Code"
                                  className="h-8 w-8 sm:h-10 sm:w-10 rounded-md shadow-md hover:brightness-110 transition-all duration-300"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <span
                          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full shadow-md transition-colors duration-300 ${
                            tournament.status === "upcoming"
                              ? "text-purple-700 bg-purple-50 hover:bg-purple-100 dark:text-purple-300 dark:bg-purple-900/50 dark:hover:bg-purple-900"
                              : tournament.status === "ongoing"
                              ? "text-green-700 bg-green-50 hover:bg-green-100 dark:text-green-300 dark:bg-green-900/50 dark:hover:bg-green-900"
                              : "text-gray-700 bg-gray-50 hover:bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50 dark:hover:bg-gray-700"
                          }`}
                        >
                          {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                        </span>
                        <span
                          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-full shadow-md transition-colors duration-300 ${
                            tournament.registration_open
                              ? "text-green-700 bg-green-50 hover:bg-green-100 dark:text-green-300 dark:bg-green-900/50 dark:hover:bg-green-900"
                              : "text-red-700 bg-red-50 hover:bg-red-100 dark:text-red-300 dark:bg-red-900/50 dark:hover:bg-red-900"
                          }`}
                        >
                          {tournament.registration_open ? "Registration Open" : "Registration Closed"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form Dialog */}
        <Dialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Create Tournament"
          className="bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-black rounded-xl shadow-2xl max-w-md mx-auto p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 ease-in-out scale-95 hover:scale-100"
        >
          <TournamentForm onSubmit={handleCreateTournament} isLoading={loading} />
        </Dialog>
      </div>

      <style >{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
          .text-xl {
            font-size: 1.125rem;
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
          .w-12 {
            width: 2.5rem;
            height: 2.5rem;
          }
          .h-10 {
            height: 2rem;
            width: 2rem;
          }
          .w-64 {
            width: 100%;
          }
          .gap-6 {
            gap: 1rem;
          }
          .gap-4 {
            gap: 0.75rem;
          }
          .py-3 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          .max-w-md {
            max-width: 100%;
          }
          .space-y-4 > * + * {
            margin-top: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Tournaments;