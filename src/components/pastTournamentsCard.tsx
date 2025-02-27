import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Calendar, Users, ArrowLeft, Medal, Eye, Target } from "lucide-react";
import { useTournaments } from "../hooks/useTournaments";
import { formatDate } from "../lib/utils";
import { supabase } from "../lib/supabase";
import { FaRupeeSign } from "react-icons/fa";
import { RealtimeChannel } from "@supabase/supabase-js";

interface TeamCount {
  [key: string]: {
    count: number;
    teams: Array<{
      team_name: string;
      logo_url?: string;
    }>;
  };
}

const AllMatches: React.FC = () => {
  const { tournaments, loading } = useTournaments({ status: "completed" });
  const [teamCounts, setTeamCounts] = useState<TeamCount>({});

  useEffect(() => {
    const fetchTeamCounts = async () => {
      try {
        const { data, error } = await supabase
          .from("registrations")
          .select("tournament_id, team_name, logo_url, status")
          .eq("status", "approved");

        if (error) throw error;

        const counts: TeamCount = {};
        data?.forEach((reg) => {
          if (!counts[reg.tournament_id]) {
            counts[reg.tournament_id] = { count: 0, teams: [] };
          }
          counts[reg.tournament_id].count++;
          counts[reg.tournament_id].teams.push({
            team_name: reg.team_name,
            logo_url: reg.logo_url,
          });
        });

        setTeamCounts(counts);
      } catch (error) {
        console.error("Error fetching team counts:", error);
      }
    };

    fetchTeamCounts();

    const subscription: RealtimeChannel = supabase
      .channel("registration_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations" },
        () => fetchTeamCounts()
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
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-purple-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-purple-700 opacity-50"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />

      <div className="relative px-4 sm:px-8 pt-20 sm:pt-24 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-6 sm:mb-8 px-3 py-1 sm:px-4 sm:py-2 bg-purple-900/30 rounded-full shadow-md hover:bg-purple-900/50 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Home</span>
          </Link>

          <div className="text-center mb-10 sm:mb-12">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 animate-pulse mb-4">
              PAST TOURNAMENTS
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 tracking-wide animate-fade-in">
              Relive the Glory of Past Champions
            </p>
          </div>

          {tournaments.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-lg rounded-2xl shadow-lg shadow-purple-500/20 animate-fade-in">
              <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-purple-400 mx-auto mb-4 sm:mb-6 animate-bounce" />
              <h3 className="text-xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">No Past Tournaments</h3>
              <p className="text-gray-300 text-sm sm:text-lg max-w-md mx-auto px-4">
                The battlefield awaits its first legends. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {tournaments.map((tournament, index) => (
                <div
                  key={tournament.id}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-lg shadow-md hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-500"
                  style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` }}
                >
                  <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-purple-500 via-indigo-500 to-purple-500" />
                  <img
                    src={
                      tournament.image_url ||
                      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop"
                    }
                    alt={tournament.title}
                    className="w-full h-52 sm:h-64 object-cover transition-transform duration-700 group-hover:scale-110 opacity-40"
                  />

                  <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-purple-600/90 text-white text-xs sm:text-sm font-medium rounded-full shadow-md">
                          {tournament.game}
                        </span>
                        <span className="px-3 py-1 bg-yellow-500/90 text-white text-xs sm:text-sm font-medium rounded-full shadow-md">
                          Completed
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                        {tournament.title}
                      </h3>

                      <div className="grid grid-cols-2 gap-2 sm:gap-4 text-gray-200 text-xs sm:text-sm">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
                          <span className="truncate">{formatDate(tournament.end_date)}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <FaRupeeSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
                          <span className="truncate">{tournament.prize_pool}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
                          <span>{teamCounts[tournament.id]?.count || 0} Teams</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 shrink-0" />
                          <span className="truncate">{tournament.format.toUpperCase()}</span>
                        </div>
                      </div>

                      <Link
                        to={`/tournament/${tournament.id}/results`}
                        className="mt-4 w-full py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-sm sm:text-base"
                      >
                        <Medal className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>View Results</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AllMatches;