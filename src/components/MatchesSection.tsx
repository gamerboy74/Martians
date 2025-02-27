import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Youtube,
  Twitch,
  RefreshCw,
  Trophy,
  ArrowRight,
  Swords,
  Calendar,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/useToast";
import { formatDate } from "../lib/utils";
import { Subscription } from "@supabase/supabase-js"; // Add this import

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

const MatchesSection: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchMatches = async () => {
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
        .in("status", ["scheduled", "live"])
        .order("start_time", { ascending: true })
        .limit(5);

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
      console.error("Error fetching matches:", error);
      toast.error("Failed to fetch matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMatches();

    // Set up subscription
    const subscription = supabase
      .channel("matches")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => {
          fetchMatches();
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array since we only want this to run once on mount

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <section
      id="matches"
      className="min-h-screen bg-transparent px-4 md:px-8 py-24 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <div className="mb-16 mt-16">
          <span className="text-gray-400 text-sm tracking-wider">#MATCHES</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-4">
            LIVE &<br />
            UPCOMING MATCHES
          </h2>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12 bg-purple-900/20 backdrop-blur-sm rounded-xl">
            <Swords className="mx-auto h-16 w-16 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              No Active Matches
            </h3>
            <p className="text-gray-400 max-w-md mx-auto px-4">
              There are no live or upcoming matches at the moment. Check out
              past matches below!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="relative overflow-hidden bg-purple-900/20 backdrop-blur-sm rounded-lg transition-all duration-300 hover:bg-purple-900/30 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent opacity-50" />
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 via-purple-400 to-purple-500" />
                <div className="relative p-4 md:p-6">
                  <div className="mb-4">
                    <span className="text-sm font-medium text-purple-400">
                      {match.tournaments?.title}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                        match.status === "live"
                          ? "bg-red-500 animate-pulse"
                          : "bg-purple-500"
                      }`}
                    >
                      {match.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-4 flex-1 text-center md:text-left">
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-md" />
                        {match.team1.logo_url ? (
                          <img
                            src={match.team1.logo_url}
                            alt={match.team1.name}
                            className="relative w-16 h-16 rounded-full object-cover border-2 border-purple-500/30"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://via.placeholder.com/64?text=T1";
                            }}
                          />
                        ) : (
                          <div className="relative w-16 h-16 rounded-full bg-purple-900/50 flex items-center justify-center border-2 border-purple-500/30">
                            <span className="text-xl font-bold text-white">
                              {match.team1.name[0]}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-white font-bold text-xl">
                        {match.team1.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-4xl font-bold text-white">
                        {match.team1.score}
                      </span>
                      <div className="w-12 h-12 rounded-full bg-purple-900/50 flex items-center justify-center">
                        <Swords className="w-6 h-6 text-purple-400" />
                      </div>
                      <span className="text-4xl font-bold text-white">
                        {match.team2.score}
                      </span>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4 flex-1 justify-end text-center md:text-right">
                      <span className="text-white font-bold text-xl order-2 md:order-1">
                        {match.team2.name}
                      </span>
                      <div className="relative order-1 md:order-2">
                        <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-md" />
                        {match.team2.logo_url ? (
                          <img
                            src={match.team2.logo_url}
                            alt={match.team2.name}
                            className="relative w-16 h-16 rounded-full object-cover border-2 border-purple-500/30"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://via.placeholder.com/64?text=T2";
                            }}
                          />
                        ) : (
                          <div className="relative w-16 h-16 rounded-full bg-purple-900/50 flex items-center justify-center border-2 border-purple-500/30">
                            <span className="text-xl font-bold text-white">
                              {match.team2.name[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-purple-400">
                      {formatDate(match.start_time)}
                    </div>
                    {match.status === "live" && match.stream_url && (
                      <div className="flex items-center gap-4">
                        <a
                          href={match.stream_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          <Youtube size={20} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            to="/past-matches"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 
    text-white font-semibold rounded-lg shadow-lg transform transition-all duration-300 
    hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-700 hover:scale-105 
    hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 
    group"
          >
            <Trophy className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
            <span className="relative">
              View Past Matches
              <span
                className="absolute -bottom-1 left-0 w-full h-0.5 bg-white opacity-0 
      group-hover:opacity-100 group-hover:animate-underline transition-opacity"
              ></span>
            </span>
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MatchesSection;
