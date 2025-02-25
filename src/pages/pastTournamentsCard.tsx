import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Calendar,
  Users,
  ArrowLeft,
  Medal,
  Eye,
  Target,
} from "lucide-react";
import { useTournaments } from "../hooks/useTournaments";
import { formatDate } from "../lib/utils";
import { supabase } from "../lib/supabase";
import { FaRupeeSign } from "react-icons/fa";

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
          .select(
            `
            tournament_id,
            team_name,
            logo_url,
            status
          `
          )
          .eq("status", "approved");

        if (error) throw error;

        const counts: TeamCount = {};
        data?.forEach((reg) => {
          if (!counts[reg.tournament_id]) {
            counts[reg.tournament_id] = {
              count: 0,
              teams: [],
            };
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

    // Subscribe to registration changes
    const subscription = supabase
      .channel("registration_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations" },
        () => {
          fetchTeamCounts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-black relative">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />

      <div className="relative px-4 sm:px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Past Tournaments
            </h1>
            <p className="text-purple-400">
              Explore our tournament history and past champions
            </p>
          </div>

          {tournaments.length === 0 ? (
            <div className="text-center py-12 bg-purple-900/20 backdrop-blur-sm rounded-xl">
              <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                No Past Tournaments
              </h3>
              <p className="text-gray-400">
                Check back later for tournament history
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-black backdrop-blur-sm 
                  transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

                  <img
                    src={
                      tournament.image_url ||
                      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop"
                    }
                    alt={tournament.title}
                    className="w-full h-64 object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-40"
                  />

                  <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-purple-500/80 text-white text-sm rounded-full">
                          {tournament.game}
                        </span>
                        <span className="px-3 py-1 bg-yellow-500/80 text-white text-sm rounded-full">
                          Completed
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                        {tournament.title}
                      </h3>

                      <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar
                            size={16}
                            className="text-purple-400 shrink-0"
                          />
                          <span className="text-sm truncate">
                            {formatDate(tournament.end_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <FaRupeeSign
                            size={16}
                            className="text-purple-400 shrink-0"
                          />
                          <span className="text-sm truncate">
                            {tournament.prize_pool}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Users
                            size={16}
                            className="text-purple-400 shrink-0"
                          />
                          <span className="text-sm">
                            {teamCounts[tournament.id]?.count || 0} Teams
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Trophy
                            size={16}
                            className="text-purple-400 shrink-0"
                          />
                          <span className="text-sm truncate">
                            {tournament.format.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/tournament/${tournament.id}/results`}
                        className="mt-4 w-full py-3 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-white 
                          font-medium transition-all duration-300 flex items-center justify-center gap-2 
                          border border-purple-500/30 group-hover:border-purple-500/50"
                      >
                        <Medal size={18} />
                        <span>VIEW RESULTS</span>
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
