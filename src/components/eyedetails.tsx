import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Trophy, Calendar, Users, ArrowLeft, Clock, Info } from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatDate } from "../lib/utils";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaRupeeSign } from "react-icons/fa";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Tournament {
  id: string;
  title: string;
  description: string;
  game: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  prize_pool: string;
  max_participants: number;
  current_participants: number;
  format: string;
  status: string;
  registration_open: boolean;
  image_url: string;
}

interface Registration {
  id: string;
  team_name: string;
  logo_url: string | null;
  status: string;
  created_at: string;
}

const TournamentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registrationCount, setRegistrationCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTournamentAndRegistrations = async () => {
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
          .not("status", "eq", "rejected");

        if (countError) throw countError;
        setRegistrationCount(count || 0);

        const { data: registrationData, error: registrationError } = await supabase
          .from("registrations")
          .select("id, team_name, logo_url, status, created_at")
          .eq("tournament_id", id)
          .not("status", "eq", "rejected");

        if (registrationError) throw registrationError;
        setRegistrations(registrationData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentAndRegistrations();

    const subscription: RealtimeChannel = supabase
      .channel("registration_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations", filter: `tournament_id=eq.${id}` },
        () => fetchTournamentAndRegistrations()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-purple-700 opacity-50"></div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center animate-fade-in p-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-6">Tournament Not Found</h2>
          <button
            onClick={() => navigate("/schedule")}
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full shadow-md hover:shadow-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Back to Schedule</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />

        <div className="relative px-4 sm:px-8 pt-28 sm:pt-32 pb-16 sm:pb-24">
          <div className="max-w-7xl mx-auto">
            {/* Back Button - Visible on all devices with adjusted styling */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-6 sm:mb-8 px-3 py-1 sm:px-4 sm:py-2 bg-purple-900/30 rounded-full shadow-md hover:bg-purple-900/50 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Back to Home</span>
            </Link>

            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden mb-12 shadow-lg shadow-purple-500/20">
              <img
                src={tournament.image_url || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&h=400&fit=crop"}
                alt={tournament.title}
                className="w-full h-64 sm:h-[28rem] object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 flex flex-col sm:flex-row justify-between items-end">
                <div>
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-2 sm:mb-4">
                    <span className="px-3 py-1 bg-purple-600/90 text-white text-xs sm:text-sm font-medium rounded-full shadow-md">
                      {tournament.game}
                    </span>
                    <span
                      className={`px-3 py-1 ${tournament.registration_open ? "bg-green-500/90" : "bg-red-500/90"} text-white text-xs sm:text-sm font-medium rounded-full shadow-md`}
                    >
                      {tournament.registration_open ? "Open Now!" : "Closed"}
                    </span>
                    <span
                      className={`px-3 py-1 ${
                        tournament.status === "upcoming"
                          ? "bg-blue-500/90"
                          : tournament.status === "ongoing"
                            ? "bg-yellow-500/90"
                            : "bg-gray-500/90"
                      } text-white text-xs sm:text-sm font-medium rounded-full shadow-md`}
                    >
                      {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white animate-fade-in">{tournament.title}</h1>
                </div>
                <div className="mt-4 sm:mt-0 text-center sm:text-right">
                  <div className="flex items-center justify-center sm:justify-end gap-2 text-gray-200">
                    <FaRupeeSign className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                    <span className="text-2xl sm:text-3xl font-bold">{tournament.prize_pool}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300">Prize Pool</p>
                </div>
              </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-4">
              {/* Key Info (Full width on mobile, 1/4 on desktop) */}
              <div className="lg:col-span-1 space-y-6 sm:space-y-8 order-2 lg:order-1">
                <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-purple-500/40 transition-shadow">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 animate-slide-in">Quick Stats</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-300">Participants</p>
                        <p className="text-base sm:text-lg font-semibold text-white">
                          {registrationCount} / {tournament.max_participants}
                        </p>
                        <div className="mt-1 w-full bg-purple-900/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(registrationCount / tournament.max_participants) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-300">Format</p>
                        <p className="text-base sm:text-lg font-semibold text-white">{tournament.format.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 shrink-0" />
                      <div>
                        <p className="text-xs sm:text-sm text-gray-300">Status</p>
                        <p
                          className={`text-base sm:text-lg font-semibold ${
                            tournament.registration_open ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {tournament.registration_open ? "Open" : "Closed"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Details (Full width on mobile, 2/4 on desktop) */}
              <div className="lg:col-span-2 space-y-6 sm:space-y-8 order-1 lg:order-2">
                <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-lg rounded-2xl p-4 sm:p-8 shadow-md hover:shadow-purple-500/40 transition-shadow">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 animate-slide-in">Tournament Overview</h2>
                  <p className="text-gray-200 text-sm sm:text-lg leading-relaxed whitespace-pre-wrap">{tournament.description}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-lg rounded-2xl p-4 sm:p-8 shadow-md hover:shadow-purple-500/40 transition-shadow">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6 animate-slide-in">Schedule</h2>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-white">Event Dates</h3>
                        <p className="text-gray-200 text-sm sm:text-base">
                          {formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-white">Registration Deadline</h3>
                        <p className="text-gray-200 text-sm sm:text-base">{formatDate(tournament.registration_deadline)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registrations (Full width on mobile, 1/4 on desktop) */}
              <div className="lg:col-span-1 order-3">
                <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-purple-500/40 transition-shadow lg:sticky lg:top-24 lg:max-h-[calc(100vh-12rem)] overflow-y-auto">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 animate-slide-in">Teams Registered</h2>
                  {registrations.length === 0 ? (
                    <div className="text-center py-6">
                      <Users className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400 mx-auto mb-4 animate-bounce" />
                      <p className="text-gray-200 text-sm sm:text-base">No teams yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {registrations.map((registration) => (
                        <div
                          key={registration.id}
                          className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-purple-900/20 rounded-lg hover:bg-purple-900/40 transition-all duration-300"
                        >
                          {registration.logo_url ? (
                            <img
                              src={registration.logo_url}
                              alt={registration.team_name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/64?text=Team";
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-900/50 rounded-full flex items-center justify-center shadow-md">
                              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                            </div>
                          )}
                          <div>
                            <h3 className="text-sm sm:text-md font-semibold text-white">{registration.team_name}</h3>
                            <p className="text-xs text-gray-300">{formatDate(registration.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

export default TournamentView;