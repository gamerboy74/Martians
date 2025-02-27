import React, { useState, useEffect } from "react";
import { Trophy, Users, Monitor, MapPin } from "lucide-react";
import { supabase } from "../lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js"; // Correct type for Supabase subscription

interface LeaderboardEntry {
  id: string;
  team_id: string;
  team_name: string;
  logo_url?: string;
  survival_points: number;
  kill_points: number;
  total_points: number;
  matches_played: number;
  wins: number;
}

const Leaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly" | "all-time">("all-time");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from("leaderboard")
        .select(
          `
          *,
          teams:registrations!team_id (
            team_name,
            logo_url
          )
        `
        )
        .order("total_points", { ascending: false });

      if (error) throw error;

      const formattedData = data.map((entry) => ({
        id: entry.id,
        team_id: entry.team_id,
        team_name: entry.teams.team_name,
        logo_url: entry.teams.logo_url,
        survival_points: entry.survival_points,
        kill_points: entry.kill_points,
        total_points: entry.total_points,
        matches_played: entry.matches_played,
        wins: entry.wins,
      }));

      setLeaderboard(formattedData);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    const subscription: RealtimeChannel = supabase
      .channel("leaderboard_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leaderboard" },
        () => fetchLeaderboard()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-700 opacity-50"></div>
        </div>
      </div>
    );
  }

  return (
    <section id="leaderboard" className="min-h-screen bg-black px-4 sm:px-8 py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 animate-pulse mb-6">
            LEADERBOARD
          </h2>
          <div className="flex justify-center gap-4 mt-8 flex-wrap px-4">
            {(["weekly", "monthly", "all-time"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 shadow-md ${
                  timeframe === t
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
                    : "bg-purple-900/30 text-gray-300 hover:bg-purple-900/50 hover:text-white"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-lg rounded-2xl shadow-lg shadow-purple-500/20 animate-fade-in">
            <Trophy className="mx-auto h-20 w-20 text-purple-400 mb-6 animate-bounce" />
            <h3 className="text-3xl font-bold text-white mb-4">No Rankings Yet</h3>
            <p className="text-gray-300 text-lg max-w-md mx-auto px-4">
              The leaderboard is waiting for champions. Rankings will rise as battles unfold!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`relative overflow-hidden backdrop-blur-lg rounded-2xl shadow-md hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300 ${
                  index === 0
                    ? "bg-gradient-to-br from-yellow-900/30 to-purple-900/30 border border-yellow-500/50"
                    : index === 1
                      ? "bg-gradient-to-br from-gray-900/30 to-purple-900/30 border border-gray-500/50"
                      : index === 2
                        ? "bg-gradient-to-br from-orange-900/30 to-purple-900/30 border border-orange-500/50"
                        : "bg-gradient-to-br from-purple-900/20 to-indigo-900/20"
                }`}
                style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
              >
                <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-500" />
                <div className="relative p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div
                          className={`absolute inset-0 rounded-full blur-md ${
                            index === 0 ? "bg-yellow-500/20" : index === 1 ? "bg-gray-500/20" : index === 2 ? "bg-orange-500/20" : "bg-purple-500/20"
                          }`}
                        />
                        {entry.logo_url ? (
                          <img
                            src={entry.logo_url}
                            alt={entry.team_name}
                            className="relative w-16 h-16 rounded-full object-cover ring-2 ring-purple-500/30 shadow-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/64?text=Logo";
                            }}
                          />
                        ) : (
                          <div
                            className={`relative w-16 h-16 rounded-full flex items-center justify-center ring-2 ring-purple-500/30 shadow-md ${
                              index === 0 ? "bg-yellow-900/50" : index === 1 ? "bg-gray-900/50" : index === 2 ? "bg-orange-900/50" : "bg-purple-900/50"
                            }`}
                          >
                            <Trophy
                              className={`w-8 h-8 ${
                                index === 0 ? "text-yellow-400" : index === 1 ? "text-gray-400" : index === 2 ? "text-orange-400" : "text-purple-400"
                              }`}
                            />
                          </div>
                        )}
                        <div
                          className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-black ${
                            index === 0 ? "bg-yellow-600" : index === 1 ? "bg-gray-600" : index === 2 ? "bg-orange-600" : "bg-purple-600"
                          }`}
                        >
                          #{index + 1}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{entry.team_name}</h3>
                        <div className="flex items-center gap-2 text-purple-300">
                          <Trophy size={18} />
                          <span className="text-lg font-semibold">{entry.total_points} Points</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto">
                      <div className="text-center p-3 bg-purple-900/40 rounded-lg">
                        <div className="text-xl font-bold text-white">{entry.survival_points}</div>
                        <div className="text-xs text-gray-300">Survival</div>
                      </div>
                      <div className="text-center p-3 bg-purple-900/40 rounded-lg">
                        <div className="text-xl font-bold text-white">{entry.kill_points}</div>
                        <div className="text-xs text-gray-300">Kills</div>
                      </div>
                      <div className="text-center p-3 bg-purple-900/40 rounded-lg">
                        <div className="text-xl font-bold text-white">{entry.wins}</div>
                        <div className="text-xs text-gray-300">Wins</div>
                      </div>
                      <div className="text-center p-3 bg-purple-900/40 rounded-lg">
                        <div className="text-xl font-bold text-white">{((entry.wins / entry.matches_played) * 100).toFixed(1)}%</div>
                        <div className="text-xs text-gray-300">Win Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </section>
  );
};

export default Leaderboard;