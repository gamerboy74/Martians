import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, Users, ArrowLeft, Medal, Crown, Target, Shield } from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatDate } from "../lib/utils";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaRupeeSign } from "react-icons/fa";
import { RealtimeChannel } from "@supabase/supabase-js";

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

        const { data: tournamentData, error: tournamentError } = await supabase
          .from("tournaments")
          .select("*")
          .eq("id", id)
          .single();

        if (tournamentError) throw tournamentError;
        setTournament(tournamentData);

        const { count, error: countError } = await supabase
          .from("registrations")
          .select("*", { count: "exact", head: true })
          .eq("tournament_id", id)
          .eq("status", "approved");

        if (!countError) setParticipantCount(count || 0);

        const { data: registrationsData, error: registrationsError } = await supabase
          .from("registrations")
          .select("id, team_name, logo_url, status, created_at")
          .eq("tournament_id", id)
          .order("created_at", { ascending: false });

        if (registrationsError) throw registrationsError;
        setRegistrations(registrationsData || []);

        const { data: leaderboardData, error: leaderboardError } = await supabase
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

    const registrationsSubscription: RealtimeChannel = supabase
      .channel("registrations_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations", filter: `tournament_id=eq.${id}` },
        () => fetchTournamentData()
      )
      .subscribe();

    const leaderboardSubscription: RealtimeChannel = supabase
      .channel("leaderboard_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard" },
        () => fetchTournamentData()
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
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-purple-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-purple-700 opacity-50"></div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center animate-fade-in p-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-6">Tournament Not Found</h2>
          <Link
            to="/all-matches"
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:shadow-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Past Tournaments</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black pointer-events-none" />

        <div className="relative px-4 sm:px-8 pt-28 sm:pt-32 pb-16 sm:pb-24">
          <div className="max-w-7xl mx-auto">
            <Link
              to="/all-matches"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 sm:mb-8 px-3 py-1 sm:px-4 sm:py-2 bg-purple-900/30 rounded-full shadow-md hover:bg-purple-900/50 transition-all duration-300 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Back to Past Tournaments</span>
            </Link>

            {/* Tournament Details */}
            <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-lg rounded-2xl overflow-hidden mb-10 sm:mb-12 shadow-lg shadow-purple-500/20">
              <div className="relative h-52 sm:h-64">
                <img
                  src={tournament.image_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&h=400&fit=crop"}
                  alt={tournament.title}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 flex flex-col sm:flex-row justify-between items-end">
                  <div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-4">
                      <span className="px-2 sm:px-3 py-1 bg-purple-600/90 text-white text-xs sm:text-sm font-medium rounded-full shadow-md">
                        {tournament.game}
                      </span>
                      <span className="px-2 sm:px-3 py-1 bg-yellow-500/90 text-white text-xs sm:text-sm font-medium rounded-full shadow-md">
                        Completed
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white animate-fade-in">{tournament.title}</h1>
                  </div>
                  <div className="mt-4 sm:mt-0 text-center sm:text-right">
                    <div className="flex items-center justify-center sm:justify-end gap-2 text-gray-200">
                      <FaRupeeSign className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                      <span className="text-xl sm:text-2xl font-bold">{tournament.prize_pool}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300">Prize Pool</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 shrink-0" />
                    <div>
                      <h3 className="text-xs sm:text-sm text-gray-300">Tournament Dates</h3>
                      <p className="text-white text-sm sm:text-base">{formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <FaRupeeSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 shrink-0" />
                    <div>
                      <h3 className="text-xs sm:text-sm text-gray-300">Prize Pool</h3>
                      <p className="text-white text-sm sm:text-base">{tournament.prize_pool}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 shrink-0" />
                    <div>
                      <h3 className="text-xs sm:text-sm text-gray-300">Participants</h3>
                      <p className="text-white text-sm sm:text-base">{participantCount}/{tournament.max_participants}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-purple-500/30 pt-6 sm:pt-8">
                  <h2 className="text-lg sm:text-xl font-bold text-white mb-4 animate-slide-in">About Tournament</h2>
                  <p className="text-gray-200 text-sm sm:text-base leading-relaxed">{tournament.description}</p>
                </div>
              </div>
            </div>

            {/* Final Standings */}
            <div className="space-y-10 sm:space-y-12">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 text-center animate-pulse">
                Final Standings
              </h2>

              {/* Top 3 Teams */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                {teams.slice(0, 3).map((team, index) => {
                  const Icon = index === 0 ? Crown : index === 1 ? Medal : Shield;
                  const colors = [
                    { bg: "from-yellow-900/30", border: "border-yellow-500/50", text: "text-yellow-400" },
                    { bg: "from-gray-900/30", border: "border-gray-500/50", text: "text-gray-400" },
                    { bg: "from-orange-900/30", border: "border-orange-500/50", text: "text-orange-400" },
                  ];
                  return (
                    <div
                      key={team.id}
                      className={`sm:${index === 0 ? "order-2" : index === 1 ? "order-1" : "order-3"} bg-gradient-to-br ${colors[index].bg} to-indigo-900/20 backdrop-blur-lg rounded-2xl p-6 sm:p-8 text-center shadow-md hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300 border ${colors[index].border}`}
                    >
                      <div className="flex justify-center mb-4 sm:mb-6">
                        <div className={`relative w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-4 ${colors[index].border}`}>
                          {team.logo_url ? (
                            <img
                              src={team.logo_url}
                              alt={team.team_name}
                              className="w-12 h-12 sm:w-20 sm:h-20 rounded-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/80?text=Team"; }}
                            />
                          ) : (
                            <Icon className={`w-8 h-8 sm:w-12 sm:h-12 ${colors[index].text}`} />
                          )}
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{team.team_name}</h3>
                      <div className="text-2xl sm:text-4xl font-bold text-purple-400 mb-2 sm:mb-4">{team.total_points}</div>
                      <div className="space-y-1 sm:space-y-2 text-gray-200 text-xs sm:text-sm">
                        <div className="flex justify-between"><span>Survival:</span><span>{team.survival_points}</span></div>
                        <div className="flex justify-between"><span>Kills:</span><span>{team.kill_points}</span></div>
                        <div className="flex justify-between"><span>Matches:</span><span>{team.matches_played}</span></div>
                        <div className="flex justify-between"><span>Wins:</span><span>{team.wins}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full Standings Table */}
              <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-lg rounded-2xl overflow-hidden shadow-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm sm:text-base">
                    <thead>
                      <tr className="border-b border-purple-500/30">
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-medium text-gray-300">Rank</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-left font-medium text-gray-300">Team</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-right font-medium text-gray-300">Survival</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-right font-medium text-gray-300">Kills</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-right font-medium text-gray-300">Total</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-right font-medium text-gray-300">Matches</th>
                        <th className="px-4 sm:px-6 py-3 sm:py-4 text-right font-medium text-gray-300">Wins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teams.map((team, index) => (
                        <tr
                          key={team.id}
                          className="border-b border-purple-500/20 hover:bg-purple-500/10 transition-colors"
                        >
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className="text-lg sm:text-2xl font-bold text-purple-400">#{index + 1}</span>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 sm:gap-4">
                              {team.logo_url ? (
                                <img
                                  src={team.logo_url}
                                  alt={team.team_name}
                                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-md"
                                  onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/40?text=Team"; }}
                                />
                              ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-900/50 rounded-full flex items-center justify-center shadow-md">
                                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                                </div>
                              )}
                              <span className="font-medium text-white">{team.team_name}</span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap text-gray-200">{team.survival_points}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap text-gray-200">{team.kill_points}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap text-purple-400 font-bold">{team.total_points}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap text-gray-200">{team.matches_played}</td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap text-gray-200">{team.wins}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Registrations Section */}
            <div className="pt-10 sm:pt-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-6 sm:mb-8 animate-slide-in text-center">
                Tournament Registrations
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {registrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
                      {registration.logo_url ? (
                        <img
                          src={registration.logo_url}
                          alt={registration.team_name}
                          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover shadow-md"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/64?text=Team"; }}
                        />
                      ) : (
                        <div className="w-10 h-10 sm:w-14 sm:h-14 bg-purple-900/50 rounded-full flex items-center justify-center shadow-md">
                          <Users className="w-5 h-5 sm:w-7 sm:h-7 text-purple-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm sm:text-lg font-semibold text-white">{registration.team_name}</h3>
                        <span
                          className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                            registration.status === "approved" ? "bg-green-500/20 text-green-400" :
                            registration.status === "rejected" ? "bg-red-500/20 text-red-400" :
                            "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-300">
                      Registered: {formatDate(registration.created_at)}
                    </div>
                  </div>
                ))}
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