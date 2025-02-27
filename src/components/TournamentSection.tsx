import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trophy, Calendar, Users, ArrowRight, Eye } from "lucide-react";
import { FaRupeeSign } from "react-icons/fa";
import { supabase } from "../lib/supabase";
import { formatDate } from "../lib/utils";
import { useApp } from "../context/AppContext";
import { useTournaments } from "../hooks/useTournaments";
import { Tournament } from "../types"; // Import the global Tournament type

// Define additional interfaces
interface RegistrationCount {
  [key: string]: number;
}

interface Notification {
  id: string;
  type: "info" | "error" | "success";
  message: string;
}

const TournamentRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification, isRegistered } = useApp();
  const { tournaments, loading } = useTournaments({
    limit: 6,
    status: "ongoing",
  });
  const [registrationCounts, setRegistrationCounts] = useState<RegistrationCount>({});

  const fetchRegistrationCounts = async () => {
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("tournament_id")
        .not("status", "eq", "rejected");

      if (error) throw error;

      const counts = data.reduce((acc: RegistrationCount, reg: { tournament_id: string }) => {
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
        () => fetchRegistrationCounts()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleRegistration = async (tournamentId: string, registrationOpen: boolean) => {
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
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate("/bgmi-registration", { state: { tournamentId } });
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
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-700 opacity-50"></div>
        </div>
      </div>
    );
  }

  return (
    <section id="tournaments" className="min-h-screen bg-black relative overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-24 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-500 animate-pulse mb-6">
            ACTIVE TOURNAMENTS
          </h2>
          <p className="text-lg text-gray-300 tracking-wide animate-fade-in">
            Unleash Your Skills & Dominate the Arena!
          </p>
        </div>

        {tournaments.length === 0 ? (
          <div className="text-center space-y-10 animate-fade-in">
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 backdrop-blur-lg rounded-2xl p-10 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-shadow">
              <Trophy className="w-20 h-20 text-purple-400 mx-auto mb-8 animate-bounce" />
              <h3 className="text-3xl font-bold text-white mb-6">
                No Active Tournaments Yet!
              </h3>
              <p className="text-gray-300 text-lg mb-8">
                The battlefield is quiet... for now. Stay tuned for epic clashes!
              </p>
              <Link
                to="/all-matches"
                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:shadow-xl hover:from-purple-700 hover:to-indigo-700 transform transition-all duration-300 group"
              >
                <span>Explore Past Victories</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tournaments.map((tournament: Tournament) => (
                <div
                  key={tournament.id}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/50 via-indigo-900/40 to-black backdrop-blur-md border border-purple-500/30 shadow-lg hover:shadow-2xl hover:shadow-purple-600/50 transform transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/80 transition-all duration-300" />
                  <img
                    src={
                      tournament.image_url ||
                      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop"
                    }
                    alt={tournament.title}
                    className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110 opacity-50"
                  />

                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        <span className="px-4 py-1 bg-purple-600/90 text-white text-sm font-medium rounded-full shadow-md">
                          {tournament.game}
                        </span>
                        <span
                          className={`px-4 py-1 ${
                            tournament.registration_open ? "bg-green-500/90" : "bg-red-500/90"
                          } text-white text-sm font-medium rounded-full shadow-md`}
                        >
                          {tournament.registration_open ? "Join Now!" : "Closed"}
                        </span>
                      </div>

                      <h3 className="text-2xl font-extrabold text-white group-hover:text-purple-300 transition-colors">
                        {tournament.title}
                      </h3>

                      <div className="grid grid-cols-2 gap-3 text-gray-200">
                        <div className="flex items-center gap-2">
                          <Calendar size={18} className="text-purple-400" />
                          <span className="text-sm">{formatDate(tournament.start_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaRupeeSign size={18} className="text-purple-400" />
                          <span className="text-sm">Prize: {tournament.prize_pool}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={18} className="text-purple-400" />
                          <span className="text-sm">
                            {registrationCounts[tournament.id] || 0}/{tournament.max_participants}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaRupeeSign size={18} className="text-purple-400" />
                          <span className="text-sm">Fee: {tournament.registration_fee}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy size={18} className="text-purple-400" />
                          <span className="text-sm">{tournament.format.toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => handleRegistration(tournament.id, tournament.registration_open)}
                          disabled={isRegistered(tournament.id) || !tournament.registration_open}
                          className={`flex-1 py-3 rounded-full font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-md
                            ${
                              isRegistered(tournament.id)
                                ? "bg-green-600/70 cursor-not-allowed"
                                : !tournament.registration_open
                                ? "bg-gray-600/70 cursor-not-allowed"
                                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg"
                            }`}
                        >
                          <Trophy size={20} />
                          <span>
                            {isRegistered(tournament.id)
                              ? "Locked In!"
                              : !tournament.registration_open
                              ? "Registration Closed"
                              : "Claim Your Spot"}
                          </span>
                        </button>
                        <Link
                          to={`/tournament/${tournament.id}`}
                          className="py-3 px-5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold flex items-center gap-2 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          <Eye size={20} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-16">
              <Link
                to="/all-matches"
                className="inline-flex items-center gap-4 px-12 py-5 bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-700 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-2xl hover:from-purple-800 hover:to-indigo-800 transform transition-all duration-500 hover:scale-105 group"
              >
                <Trophy className="w-6 h-6 group-hover:animate-spin" />
                <span>Relive Epic Battles</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default TournamentRegistration;