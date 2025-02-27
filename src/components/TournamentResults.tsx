import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Trophy,
  Calendar,
  Users,
  ArrowLeft,
  Medal,
  Crown,
  Target,
  Shield,
  Info,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatDate } from "../lib/utils";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaRupeeSign } from "react-icons/fa";

interface TournamentResult {
  id: string;
  title: string;
  description: string;
  game: string;
  start_date: string;
  end_date: string;
  prize_pool: string;
  max_participants: number;
  current_participants: number;
  format: string;
  status: string;
  image_url: string;
}

interface TeamResult {
  id: string;
  team_name: string;
  logo_url?: string;
  total_points: number;
  survival_points: number;
  kill_points: number;
  matches_played: number;
  wins: number;
}

interface Registration {
  id: string;
  team_name: string;
  logo_url?: string;
  status: string;
  created_at: string;
}

const TournamentResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<TournamentResult | null>(null);
  const [teams, setTeams] = useState<TeamResult[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    const fetchTournamentData = async () => {
      try {
        if (!id) return;

        // Fetch tournament details
        const { data: tournamentData, error: tournamentError } = await supabase
          .from("tournaments")
          .select("*")
          .eq("id", id)
          .single();

        if (tournamentError) throw tournamentError;
        setTournament(tournamentData);

        // Fetch registration count for this tournament
        const { count, error: countError } = await supabase
          .from("registrations")
          .select("*", { count: "exact", head: true })
          .eq("tournament_id", id)
          .eq("status", "approved");

        if (!countError) {
          setParticipantCount(count || 0);
        }

        // Fetch all registrations for this tournament
        const { data: registrationsData, error: registrationsError } =
          await supabase
            .from("registrations")
            .select("id, team_name, logo_url, status, created_at")
            .eq("tournament_id", id)
            .order("created_at", { ascending: false });

        if (registrationsError) throw registrationsError;
        setRegistrations(registrationsData || []);

        // Fetch team results from leaderboard for this tournament's teams
        const { data: leaderboardData, error: leaderboardError } =
          await supabase
            .from("leaderboard")
            .select(
              `
            *,
            registrations!inner (
              team_name,
              logo_url,
              tournament_id
            )
          `
            )
            .eq("registrations.tournament_id", id)
            .order("total_points", { ascending: false });

        if (leaderboardError) throw leaderboardError;

        const formattedTeams = (leaderboardData || []).map((entry) => ({
          id: entry.team_id,
          team_name: entry.registrations.team_name,
          logo_url: entry.registrations.logo_url,
          total_points: entry.total_points,
          survival_points: entry.survival_points,
          kill_points: entry.kill_points,
          matches_played: entry.matches_played,
          wins: entry.wins,
        }));

        setTeams(formattedTeams);
      } catch (error) {
        console.error("Error fetching tournament data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentData();

    // Subscribe to changes
    const registrationsSubscription = supabase
      .channel("registrations_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "registrations",
          filter: `tournament_id=eq.${id}`,
        },
        () => {
          fetchTournamentData();
        }
      )
      .subscribe();

    const leaderboardSubscription = supabase
      .channel("leaderboard_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leaderboard",
        },
        () => {
          fetchTournamentData();
        }
      )
      .subscribe();

    return () => {
      registrationsSubscription.unsubscribe();
      leaderboardSubscription.unsubscribe();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Tournament not found
          </h2>
          <Link
            to="/all-matches"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Past Tournaments</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />

        <div className="relative px-8 py-24">
          <div className="max-w-7xl mt-10 mx-auto">
            <Link
              to="/all-matches"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Past Tournaments</span>
            </Link>

            {/* Tournament Details */}
            <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl overflow-hidden mb-12">
              <div className="relative h-64">
                <img
                  src={
                    tournament.image_url ||
                    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&h=400&fit=crop"
                  }
                  alt={tournament.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex flex-wrap gap-4 mb-4">
                    <span className="px-3 py-1 bg-purple-500/80 text-white text-sm rounded-full">
                      {tournament.game}
                    </span>
                    <span className="px-3 py-1 bg-green-500/80 text-white text-sm rounded-full">
                      {tournament.status.charAt(0).toUpperCase() +
                        tournament.status.slice(1)}
                    </span>
                  </div>
                  <h1 className="text-4xl font-bold text-white">
                    {tournament.title}
                  </h1>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="flex items-center gap-4">
                    <Calendar className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="text-sm text-gray-400">
                        Tournament Dates
                      </h3>
                      <p className="text-white">
                        {formatDate(tournament.start_date)} -{" "}
                        {formatDate(tournament.end_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <FaRupeeSign className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="text-sm text-gray-400">Prize Pool</h3>
                      <p className="text-white">{tournament.prize_pool}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Users className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="text-sm text-gray-400">Participants</h3>
                      <p className="text-white">
                        {participantCount}/{tournament.max_participants}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-purple-500/20 pt-8">
                  <h2 className="text-xl font-bold text-white mb-4">
                    About Tournament
                  </h2>
                  <p className="text-gray-300">{tournament.description}</p>
                </div>
              </div>
            </div>

            {/* Final Standings */}
            <div className="space-y-12">
              <h2 className="text-3xl font-bold text-white text-center">
                Final Standings
              </h2>

              {/* Top 3 Teams */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {teams.slice(0, 3).map((team, index) => {
                  const Icon =
                    index === 0 ? Crown : index === 1 ? Medal : Shield;
                  const colors = [
                    {
                      bg: "bg-yellow-100",
                      text: "text-yellow-600",
                      border: "border-yellow-200",
                    },
                    {
                      bg: "bg-gray-100",
                      text: "text-gray-600",
                      border: "border-gray-200",
                    },
                    {
                      bg: "bg-orange-100",
                      text: "text-orange-600",
                      border: "border-orange-200",
                    },
                  ];
                  return (
                    <div
                      key={team.id}
                      className={`${index === 0 ? "md:order-2" : index === 1 ? "md:order-1" : "md:order-3"} 
                      bg-purple-900/20 backdrop-blur-sm rounded-xl p-8 text-center transform hover:scale-105 transition-transform duration-300`}
                    >
                      <div className="flex justify-center mb-6">
                        <div
                          className={`relative w-24 h-24 ${colors[index].bg} rounded-full flex items-center justify-center border-4 ${colors[index].border}`}
                        >
                          {team.logo_url ? (
                            <img
                              src={team.logo_url}
                              alt={team.team_name}
                              className="w-20 h-20 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src =
                                  "https://via.placeholder.com/80?text=Team";
                              }}
                            />
                          ) : (
                            <Icon
                              className={`w-12 h-12 ${colors[index].text}`}
                            />
                          )}
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {team.team_name}
                      </h3>
                      <div className="text-4xl font-bold text-purple-400 mb-4">
                        {team.total_points}
                      </div>
                      <div className="space-y-2 text-gray-300">
                        <div className="flex justify-between">
                          <span>Survival Points:</span>
                          <span>{team.survival_points}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Kill Points:</span>
                          <span>{team.kill_points}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Matches:</span>
                          <span>{team.matches_played}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Wins:</span>
                          <span>{team.wins}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full Standings Table */}
              <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-500/20">
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          Rank
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">
                          Team
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                          Survival Points
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                          Kill Points
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                          Total Points
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                          Matches
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                          Wins
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((team, index) => (
                        <tr
                          key={team.id}
                          className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-2xl font-bold text-purple-400">
                                #{index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {team.logo_url ? (
                                <img
                                  src={team.logo_url}
                                  alt={team.team_name}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src =
                                      "https://via.placeholder.com/40?text=Team";
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 bg-purple-900/50 rounded-full flex items-center justify-center">
                                  <Target className="w-5 h-5 text-purple-400" />
                                </div>
                              )}
                              <span className="ml-4 font-medium text-white">
                                {team.team_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap text-gray-300">
                            {team.survival_points}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap text-gray-300">
                            {team.kill_points}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            <span className="text-lg font-bold text-purple-400">
                              {team.total_points}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap text-gray-300">
                            {team.matches_played}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap text-gray-300">
                            {team.wins}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Registrations Section */}
            <div className="relative px-8 py-12">
              <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl font-bold text-white mb-8">
                  Tournament Registrations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {registrations.map((registration) => (
                    <div
                      key={registration.id}
                      className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        {registration.logo_url ? (
                          <img
                            src={registration.logo_url}
                            alt={registration.team_name}
                            className="w-16 h-16 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://via.placeholder.com/64?text=Team";
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-purple-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {registration.team_name}
                          </h3>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                              registration.status === "approved"
                                ? "bg-green-500/20 text-green-400"
                                : registration.status === "rejected"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {registration.status.charAt(0).toUpperCase() +
                              registration.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400">
                        Registered: {formatDate(registration.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TournamentResults;
