import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Trophy, Calendar, Users, ArrowLeft, Clock, Info } from "lucide-react";
import { supabase } from "../lib/supabase";
import { formatDate } from "../lib/utils";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { FaRupeeSign } from "react-icons/fa";

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

        // Fetch tournament details
        const { data: tournamentData, error: tournamentError } = await supabase
          .from("tournaments")
          .select("*")
          .eq("id", id)
          .single();

        if (tournamentError) throw tournamentError;
        setTournament(tournamentData);

        // Fetch registration count
        const { count, error: countError } = await supabase
          .from("registrations")
          .select("*", { count: "exact", head: true })
          .eq("tournament_id", id)
          .not("status", "eq", "rejected");

        if (countError) throw countError;
        setRegistrationCount(count || 0);

        // Fetch registrations details (including created_at)
        const { data: registrationData, error: registrationError } =
          await supabase
            .from("registrations")
            .select("id, team_name, logo_url, status, created_at") // Added created_at
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

    // Subscribe to registration changes
    const subscription = supabase
      .channel("registration_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "registrations",
          filter: `tournament_id=eq.${id}`,
        },
        () => {
          fetchTournamentAndRegistrations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Tournament not found
          </h2>
          <button
            onClick={() => navigate("/schedule")}
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Schedule</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />

        <div className="relative px-8 py-24">
          <div className="max-w-7xl mx-auto">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mt-10 mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>

            {/* Hero Section */}
            <div className="relative rounded-2xl overflow-hidden mb-12">
              <img
                src={
                  tournament.image_url ||
                  "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&h=400&fit=crop"
                }
                alt={tournament.title}
                className="w-full h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex flex-wrap gap-4 mb-4">
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
                  <span
                    className={`px-3 py-1 ${
                      tournament.status === "upcoming"
                        ? "bg-blue-500/80"
                        : tournament.status === "ongoing"
                          ? "bg-yellow-500/80"
                          : "bg-gray-500/80"
                    } text-white text-sm rounded-full`}
                  >
                    {tournament.status.charAt(0).toUpperCase() +
                      tournament.status.slice(1)}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {tournament.title}
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    About Tournament
                  </h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {tournament.description}
                  </p>
                </div>

                <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Tournament Schedule
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Calendar className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Tournament Dates
                        </h3>
                        <p className="text-gray-300">
                          {formatDate(tournament.start_date)} -{" "}
                          {formatDate(tournament.end_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Clock className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Registration Deadline
                        </h3>
                        <p className="text-gray-300">
                          {formatDate(tournament.registration_deadline)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Tournament Format
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Trophy className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Format
                        </h3>
                        <p className="text-gray-300">
                          {tournament.format.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Users className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Participants
                        </h3>
                        <p className="text-gray-300">
                          {registrationCount} / {tournament.max_participants}{" "}
                          Teams Registered
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Prize Pool
                  </h2>
                  <div className="flex items-center gap-4 mb-6">
                    <FaRupeeSign className="w-12 h-12 text-purple-400" />
                    <span className="text-4xl font-bold text-white">
                      {tournament.prize_pool}
                    </span>
                  </div>
                </div>

                <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-8">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Important Info
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Info className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Registration Status
                        </h3>
                        <p
                          className={`text-sm ${
                            tournament.registration_open
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {tournament.registration_open
                            ? "Open for Registration"
                            : "Registration Closed"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Trophy className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Tournament Status
                        </h3>
                        <p className="text-gray-300">
                          {tournament.status.charAt(0).toUpperCase() +
                            tournament.status.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Users className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Registration Progress
                        </h3>
                        <p className="text-gray-300">
                          {registrationCount} out of{" "}
                          {tournament.max_participants} spots filled
                        </p>
                        <div className="mt-2 w-full bg-purple-900/50 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${(registrationCount / tournament.max_participants) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Registrations Section */}
        <div className="relative px-8 py-12">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">
              Tournament Registrations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((registration) => (
                <div
                  key={registration.id}
                  className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {registration.logo_url ? (
                      <img
                        src={registration.logo_url}
                        alt={registration.team_name}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "https://via.placeholder.com/64?text=Team";
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-purple-900/50 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-purple-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {registration.team_name}
                      </h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          registration.status === "approved"
                            ? "bg-green-500/20 text-green-400"
                            : registration.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {registration.status.charAt(0).toUpperCase() +
                          registration.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Registered: {formatDate(registration.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TournamentView;
