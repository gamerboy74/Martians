import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Trophy,
  Swords,
  Calendar,
  Youtube,
  ArrowLeft,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/useToast";
import { formatDate } from "../lib/utils";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { RealtimeChannel } from "@supabase/supabase-js"; // Added for correct typing

interface Match {
  id: string;
  team1: { name: string; score: number; logo_url?: string };
  team2: { name: string; score: number; logo_url?: string };
  tournament_id: string;
  status: "scheduled" | "live" | "completed";
  start_time: string;
  stream_url?: string;
  tournaments?: { title: string };
}

const PastMatches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchPastMatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("matches")
        .select(
          `
          *,
          tournaments (
            title
          ),
          team1:registrations!team1_id (
            team_name,
            logo_url
          ),
          team2:registrations!team2_id (
            team_name,
            logo_url
          )
        `
        )
        .eq("status", "completed")
        .order("start_time", { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedMatches = data.map((match) => ({
        id: match.id,
        team1: {
          name: match.team1?.team_name || "TBD",
          score: match.team1_score || 0,
          logo_url: match.team1?.logo_url,
        },
        team2: {
          name: match.team2?.team_name || "TBD",
          score: match.team2_score || 0,
          logo_url: match.team2?.logo_url,
        },
        tournament_id: match.tournament_id,
        status: match.status,
        start_time: match.start_time,
        stream_url: match.stream_url,
        tournaments: match.tournaments,
      }));

      setMatches(formattedMatches);
    } catch (error) {
      console.error("Error fetching past matches:", error);
      toast.error("Failed to fetch past matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPastMatches();

    // Optional: Add real-time updates if desired
    const subscription: RealtimeChannel = supabase
      .channel("past_matches_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: "status=eq.completed",
        },
        () => fetchPastMatches()
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
          <RefreshCw className="w-10 h-10 text-purple-500 animate-spin" />
          <div className="absolute inset-0 animate-ping rounded-full h-10 w-10 border-2 border-purple-700 opacity-50"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="flex-1">
        <section className="px-4 md:px-8 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black pointer-events-none" />
          <div className="max-w-7xl mt-10 mx-auto relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-12 px-4 py-2 bg-purple-900/30 rounded-full shadow-md hover:bg-purple-900/50"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Live Matches</span>
            </Link>

            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 animate-pulse mb-6">
                PAST MATCHES
              </h1>
              <p className="text-lg text-gray-300 tracking-wide animate-fade-in">
                Relive the Epic Battles of the Past
              </p>
            </div>

            {matches.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-lg rounded-2xl shadow-lg shadow-purple-500/20 animate-fade-in">
                <Trophy className="mx-auto h-20 w-20 text-purple-400 mb-6 animate-bounce" />
                <h3 className="text-3xl font-bold text-white mb-4">
                  No Past Matches
                </h3>
                <p className="text-gray-300 text-lg max-w-md mx-auto px-4">
                  The archives are empty. Check back after some epic showdowns!
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {matches.map((match, index) => (
                  <div
                    key={match.id}
                    className="relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-lg rounded-2xl shadow-md hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300 group"
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-500" />
                    <div className="relative p-6">
                      <div className="flex flex-wrap justify-between items-center mb-4">
                        <span className="text-md font-semibold text-purple-300">
                          {match.tournaments?.title || "Unknown Tournament"}
                        </span>
                        <span className="px-4 py-1 rounded-full text-sm font-medium text-white bg-green-500/90 shadow-md">
                          COMPLETED
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        {/* Team 1 */}
                        <div className="flex items-center gap-4 justify-start">
                          <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md group-hover:bg-purple-500/30 transition-all" />
                            {match.team1.logo_url ? (
                              <img
                                src={match.team1.logo_url}
                                alt={match.team1.name}
                                className="relative w-14 h-14 rounded-full object-cover border-2 border-purple-500/50 shadow-md"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://via.placeholder.com/64?text=T1";
                                }}
                              />
                            ) : (
                              <div className="relative w-14 h-14 rounded-full bg-purple-900/50 flex items-center justify-center border-2 border-purple-500/50 shadow-md">
                                <span className="text-lg font-bold text-white">
                                  {match.team1.name[0]}
                                </span>
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="text-white font-bold text-lg block">
                              {match.team1.name}
                            </span>
                            <span className="text-gray-300 text-sm">
                              Score: {match.team1.score}
                            </span>
                          </div>
                        </div>

                        {/* VS and Time */}
                        <div className="flex flex-col items-center gap-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-purple-900/50 flex items-center justify-center shadow-md">
                            <Swords className="w-6 h-6 text-purple-400" />
                          </div>
                          <span className="text-3xl font-extrabold text-white">
                            VS
                          </span>
                          <div className="flex items-center gap-2 text-gray-200">
                            <Calendar size={16} className="text-purple-400" />
                            <span className="text-sm">
                              {formatDate(match.start_time)}
                            </span>
                          </div>
                        </div>

                        {/* Team 2 */}
                        <div className="flex items-center gap-4 justify-end">
                          <div>
                            <span className="text-white font-bold text-lg block text-right">
                              {match.team2.name}
                            </span>
                            <span className="text-gray-300 text-sm block text-right">
                              Score: {match.team2.score}
                            </span>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-md group-hover:bg-purple-500/30 transition-all" />
                            {match.team2.logo_url ? (
                              <img
                                src={match.team2.logo_url}
                                alt={match.team2.name}
                                className="relative w-14 h-14 rounded-full object-cover border-2 border-purple-500/50 shadow-md"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "https://via.placeholder.com/64?text=T2";
                                }}
                              />
                            ) : (
                              <div className="relative w-14 h-14 rounded-full bg-purple-900/50 flex items-center justify-center border-2 border-purple-500/50 shadow-md">
                                <span className="text-lg font-bold text-white">
                                  {match.team2.name[0]}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {match.stream_url && (
                        <div className="mt-4 flex justify-center">
                          <a
                            href={match.stream_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:shadow-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
                          >
                            <Youtube size={20} />
                            <span>Watch Replay</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PastMatches;
