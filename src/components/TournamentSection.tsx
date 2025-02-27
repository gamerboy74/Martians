import React from "react";
import { Link } from "react-router-dom";
import { Trophy, Calendar, Users, ArrowRight, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useTournaments } from "../hooks/useTournaments";
import { formatDate } from "../lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { FaRupeeSign } from "react-icons/fa";

interface RegistrationCount {
  [key: string]: number;
}

const TournamentRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification, isRegistered } = useApp();
  const { tournaments, loading } = useTournaments({
    limit: 6,
    status: "ongoing",
  });
  const [registrationCounts, setRegistrationCounts] =
    useState<RegistrationCount>({});

  const fetchRegistrationCounts = async () => {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("tournament_id")
        .not("status", "eq", "rejected");

      if (error) throw error;

      const counts = data.reduce((acc: RegistrationCount, reg) => {
        acc[reg.tournament_id] = (acc[reg.tournament_id] || 0) + 1;
        return acc;
      }, {});

      setRegistrationCounts(counts);
    } catch (error) {
      console.error("Error fetching registration counts:", error);
    }
  };

  useEffect(() => {
    fetchRegistrationCounts();

    const subscription = supabase
      .channel("registration_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "registrations",
          filter: "status=neq.rejected",
        },
        () => {
          fetchRegistrationCounts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleRegistration = async (
    tournamentId: string,
    registrationOpen: boolean
  ) => {
    if (!registrationOpen) {
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message: "Registration is currently closed for this tournament.",
      });
      return;
    }

    if (isRegistered(tournamentId)) {
      addNotification({
        id: Date.now().toString(),
        type: "info",
        message: "You are already registered for this tournament.",
      });
      return;
    }

    try {
      // Scroll to top before navigation
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Small delay to ensure smooth scroll before navigation
      setTimeout(() => {
        navigate("/bgmi-registration", {
          state: { tournamentId },
        });
      }, 300);
    } catch (error) {
      console.error("Registration error:", error);
      addNotification({
        id: Date.now().toString(),
        type: "error",
        message: "An error occurred during registration.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <section
      id="tournaments"
      className="min-h-screen bg-black relative overflow-x-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />

      <div className="max-w-7xl mx-auto relative px-4 sm:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 animate-glow">
            ACTIVE TOURNAMENTS
          </h2>
          <p className="text-purple-400 text-lg">
            Register now and compete with the best
          </p>
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center space-y-8">
            <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-8">
              <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">
                No Active Tournaments
              </h3>
              <p className="text-gray-400 mb-8">
                There are currently no active tournaments. Check back later or
                view past tournaments.
              </p>
              <Link
                to="/all-matches"
                className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white 
                  font-medium transition-colors group"
              >
                <span>VIEW PAST TOURNAMENTS</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className="w-full h-66 object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-50"
                  />

                  <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-purple-500/80 text-white text-sm rounded-full">
                          {tournament.game}
                        </span>
                        <span
                          className={`px-3 py-1 ${
                            tournament.registration_open
                              ? "bg-green-500/80"
                              : "bg-red-500/80"
                          } text-white text-sm rounded-full`}
                        >
                          {tournament.registration_open
                            ? "Registration Open"
                            : "Registration Closed"}
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                        {tournament.title}
                      </h3>

                      <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar size={16} className="text-purple-400" />
                          <span className="text-sm">
                            {formatDate(tournament.start_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <FaRupeeSign size={16} className="text-purple-400" />
                          <span className="text-sm">
                            {tournament.prize_pool}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Users size={16} className="text-purple-400" />
                          <span className="text-sm">
                            {registrationCounts[tournament.id] || 0}/
                            {tournament.max_participants}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Trophy size={16} className="text-purple-400" />
                          <span className="text-sm">
                            {tournament.format.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() =>
                            handleRegistration(
                              tournament.id,
                              tournament.registration_open
                            )
                          }
                          disabled={
                            isRegistered(tournament.id) ||
                            !tournament.registration_open
                          }
                          className={`flex-1 py-3 rounded-lg text-white font-medium transition-all duration-300 
                            flex items-center justify-center gap-2 border border-purple-500/30 group-hover:border-purple-500/50
                            ${
                              isRegistered(tournament.id)
                                ? "bg-green-500/20 cursor-not-allowed"
                                : !tournament.registration_open
                                  ? "bg-gray-500/20 cursor-not-allowed"
                                  : "bg-purple-500/20 hover:bg-purple-500/30"
                            }`}
                        >
                          <Trophy size={18} />
                          <span className="text-sm">
                            {isRegistered(tournament.id)
                              ? "REGISTERED"
                              : !tournament.registration_open
                                ? "REGISTRATION CLOSED"
                                : "REGISTER NOW"}
                          </span>
                        </button>
                        <Link
                          to={`/tournament/${tournament.id}`}
                          className="py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 
                            flex items-center justify-center gap-2 border border-purple-500/30 bg-purple-500/20 
                            hover:bg-purple-500/30 group-hover:border-purple-500/50"
                        >
                          <Eye size={18} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <Link
                to="/all-matches"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 
    text-white font-semibold rounded-lg shadow-lg transform transition-all duration-300 
    hover:bg-gradient-to-r hover:from-purple-700 hover:to-indigo-700 hover:scale-105 
    hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 
    group"
              >
                <Trophy className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
                <span className="relative">
                  View Past Tournaments
                  <span
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-white opacity-0 
      group-hover:opacity-100 group-hover:animate-underline transition-opacity"
                  ></span>
                </span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default TournamentRegistration;
