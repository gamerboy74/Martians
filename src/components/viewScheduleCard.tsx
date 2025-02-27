import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Calendar, Users, ArrowLeft, Clock, Eye, Target } from "lucide-react";
import { useTournaments } from "../hooks/useTournaments";
import { formatDate } from "../lib/utils";
import { supabase } from "../lib/supabase";
import Navbar from "./Navbar";
import Footer from "./Footer";
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

const Schedule: React.FC = () => {
  const { tournaments, loading } = useTournaments({ status: "upcoming" });
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

    const subscription = supabase
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
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-700 opacity-50"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />

        <div className="relative px-4 sm:px-8 py-24">
          <div className="max-w-7xl mt-10 mx-auto">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-12 px-4 py-2 bg-purple-900/30 rounded-full shadow-md hover:bg-purple-900/50"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>

            <div className="text-center mb-16">
              <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 animate-pulse mb-6">
                UPCOMING TOURNAMENTS
              </h1>
              <p className="text-lg text-gray-300 tracking-wide animate-fade-in">
                Gear Up for the Next Big Showdown!
              </p>
            </div>

            {tournaments.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-lg rounded-2xl shadow-lg shadow-purple-500/20 animate-fade-in">
                <Calendar className="w-20 h-20 text-purple-400 mx-auto mb-6 animate-bounce" />
                <h3 className="text-3xl font-bold text-white mb-4">
                  No Upcoming Tournaments
                </h3>
                <p className="text-gray-300 text-lg">
                  The arena is silent... for now. Stay tuned for action!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tournaments.map((tournament) => (
                  <div
                    key={tournament.id}
                    className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/90 to-black backdrop-blur-md border border-purple-500/30 shadow-lg hover:shadow-2xl hover:shadow-purple-600/50 transform transition-all duration-500 hover:-translate-y-2"
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/80 transition-all duration-300" />
                    <img
                      src={
                        tournament.image_url ||
                        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop"
                      }
                      alt={tournament.title}
                      className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    <div className="p-6 space-y-4 relative">
                      <div className="flex flex-wrap gap-3 absolute top-4 left-4">
                        <span className="px-4 py-1 bg-purple-600/90 text-white text-sm font-medium rounded-full shadow-md">
                          {tournament.game}
                        </span>
                        <span
                          className={`px-4 py-1 ${
                            tournament.registration_open ? "bg-green-500/90" : "bg-red-500/90"
                          } text-white text-sm font-medium rounded-full shadow-md`}
                        >
                          {tournament.registration_open ? "Open Now!" : "Closed"}
                        </span>
                      </div>

                      <h3 className="text-2xl font-extrabold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                        {tournament.title}
                      </h3>

                      <div className="space-y-4 text-gray-200">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-purple-400 shrink-0" />
                            <span className="text-sm">{formatDate(tournament.start_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={18} className="text-purple-400 shrink-0" />
                            <span className="text-sm">
                              Deadline: {formatDate(tournament.registration_deadline)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <FaRupeeSign size={18} className="text-purple-400 shrink-0" />
                            <span className="text-sm">Prize: ₹{tournament.prize_pool.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaRupeeSign size={18} className="text-purple-400 shrink-0" />
                            <span className="text-sm">Fee: ₹{tournament.registration_fee.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users size={18} className="text-purple-400 shrink-0" />
                          <span className="text-sm">
                            {teamCounts[tournament.id]?.count || 0} Teams • {tournament.format.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/tournament/${tournament.id}`}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-full text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg group"
                      >
                        <Eye size={20} className="group-hover:animate-pulse" />
                        <span>View Details</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Schedule;