import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Trophy, Users, Swords, TrendingUp } from "lucide-react";
import { supabase } from "../lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface DashboardStats {
  activeTournaments: number;
  totalRegistrations: number;
  matchesCompleted: number;
  revenue: number;
}

interface ActivityData {
  name: string;
  tournaments: number;
  registrations: number;
  matches: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    activeTournaments: 0,
    totalRegistrations: 0,
    matchesCompleted: 0,
    revenue: 0,
  });
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [recentTournaments, setRecentTournaments] = useState<any[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      const [{ data: tournaments }, { count: registrationsCount }, { data: matches }] = await Promise.all([
        supabase.from("tournaments").select("id, status").eq("status", "ongoing"),
        supabase.from("registrations").select("id", { count: "exact" }),
        supabase.from("matches").select("id, status").eq("status", "completed"),
      ]);

      setStats({
        activeTournaments: tournaments?.length || 0,
        totalRegistrations: registrationsCount || 0,
        matchesCompleted: matches?.length || 0,
        revenue: calculateRevenue(registrationsCount || 0),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchActivityData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 2);

      const months = Array.from({ length: 3 }, (_, i) => {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        return date.toLocaleString("default", { month: "short" });
      });

      const data = await Promise.all(
        months.map(async (month) => {
          const [tournaments, registrations, matches] = await Promise.all([
            supabase.from("tournaments").select("created_at").gte("created_at", startDate.toISOString()).lt("created_at", endDate.toISOString()),
            supabase.from("registrations").select("created_at").gte("created_at", startDate.toISOString()).lt("created_at", endDate.toISOString()),
            supabase.from("matches").select("created_at").gte("created_at", startDate.toISOString()).lt("created_at", endDate.toISOString()),
          ]);

          return {
            name: month,
            tournaments: tournaments.data?.length || 0,
            registrations: registrations.data?.length || 0,
            matches: matches.data?.length || 0,
          };
        })
      );
      setActivityData(data);
    } catch (error) {
      console.error("Error fetching activity data:", error);
    }
  };

  const fetchRecentData = async () => {
    try {
      const [tournaments, registrations] = await Promise.all([
        supabase.from("tournaments").select("*").order("created_at", { ascending: false }).limit(3),
        supabase.from("registrations").select("*, tournaments (title)").order("created_at", { ascending: false }).limit(3),
      ]);

      setRecentTournaments(tournaments.data || []);
      setRecentRegistrations(registrations.data || []);
    } catch (error) {
      console.error("Error fetching recent data:", error);
    }
  };

  const calculateRevenue = (registrations: number) => {
    return registrations * 10;
  };

  useEffect(() => {
    fetchStats();
    fetchActivityData();
    fetchRecentData();

    const subscriptions: RealtimeChannel[] = [
      supabase.channel("tournaments_changes").on("postgres_changes", { event: "*", schema: "public", table: "tournaments" }, () => {
        fetchStats();
        fetchActivityData();
        fetchRecentData();
      }).subscribe(),
      supabase.channel("registrations_changes").on("postgres_changes", { event: "*", schema: "public", table: "registrations" }, () => {
        fetchStats();
        fetchActivityData();
        fetchRecentData();
      }).subscribe(),
      supabase.channel("matches_changes").on("postgres_changes", { event: "*", schema: "public", table: "matches" }, () => {
        fetchStats();
        fetchActivityData();
      }).subscribe(),
    ];

    return () => subscriptions.forEach((sub) => sub.unsubscribe());
  }, []);

  const statCards = [
    { title: "Active Tournaments", value: stats.activeTournaments.toString(), change: "+20%", icon: Trophy, color: "text-purple-600", bgColor: "bg-purple-50" },
    { title: "Total Registrations", value: stats.totalRegistrations.toString(), change: "+15%", icon: Users, color: "text-blue-600", bgColor: "bg-blue-50" },
    { title: "Matches Completed", value: stats.matchesCompleted.toString(), change: "+12%", icon: Swords, color: "text-green-600", bgColor: "bg-green-50" },
    { title: "Revenue Generated", value: `$${stats.revenue.toLocaleString()}`, change: "+25%", icon: TrendingUp, color: "text-orange-600", bgColor: "bg-orange-50" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-lg border border-gray-200/50">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-fade-in">
            Dashboard
          </h1>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="bg-white/95 rounded-xl shadow-md p-3 sm:p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-200/50"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor} shadow-sm`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 ${stat.color} transition-transform duration-300 hover:scale-110`} />
                  </div>
                  <span className={`text-xs font-medium ${stat.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="mt-2">
                  <h2 className="text-xs sm:text-sm font-medium text-gray-600 truncate">{stat.title}</h2>
                  <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity Overview */}
        <div className="bg-white/95 rounded-xl shadow-lg p-3 sm:p-4 border border-gray-200/50">
          <h2 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 mb-3 sm:mb-4 animate-slide-in">
            Activity Overview
          </h2>
          <div className="h-48 sm:h-56 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} barSize={16} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10, dy: 5 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "#374151" }}
                  itemStyle={{ color: "#1f2937" }}
                />
                <Bar dataKey="tournaments" name="Tournaments" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="registrations" name="Registrations" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="matches" name="Matches" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Tournaments and Registrations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          {/* Recent Tournaments */}
          <div className="bg-white/95 rounded-xl shadow-lg p-3 sm:p-4 border border-gray-200/50">
            <h2 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 mb-3 sm:mb-4 animate-slide-in">
              Recent Tournaments
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {recentTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="p-2 sm:p-3 bg-gray-50 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-50 rounded-lg flex items-center justify-center shadow-sm">
                        <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-900 truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                          {tournament.title}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {tournament.current_participants}/{tournament.max_participants}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-1.5 sm:px-2 py-0.5 text-xs font-medium rounded-full shadow-md transition-colors duration-300 hover:bg-opacity-80 ${
                        tournament.status === "ongoing" ? "text-green-700 bg-green-50" : "text-purple-700 bg-purple-50"
                      }`}
                    >
                      {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="bg-white/95 rounded-xl shadow-lg p-3 sm:p-4 border border-gray-200/50">
            <h2 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 mb-3 sm:mb-4 animate-slide-in">
              Recent Registrations
            </h2>
            <div className="space-y-2 sm:space-y-3">
              {recentRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="p-2 sm:p-3 bg-gray-50 rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {registration.logo_url ? (
                        <img
                          src={registration.logo_url}
                          alt={registration.team_name}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover shadow-md hover:brightness-110 transition-all duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://via.placeholder.com/32?text=Team";
                          }}
                        />
                      ) : (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-50 rounded-full flex items-center justify-center shadow-md">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xs sm:text-sm md:text-base font-medium text-gray-900 truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                          {registration.team_name}
                        </h3>
                        <p className="text-xs text-gray-600 truncate max-w-[100px] sm:max-w-[150px] md:max-w-[200px]">
                          {registration.tournaments?.title}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-1.5 sm:px-2 py-0.5 text-xs font-medium rounded-full shadow-md transition-colors duration-300 hover:bg-opacity-80 ${
                        registration.status === "approved" ? "text-green-700 bg-green-50" : "text-yellow-700 bg-yellow-50"
                      }`}
                    >
                      {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-in { animation: slide-in 0.5s ease-out; }

        /* Responsive Adjustments for Small Devices */
        @media (max-width: 640px) {
          .min-h-screen {
            padding: 0.5rem; /* Tight padding for mobile */
          }
          .max-w-7xl {
            margin-left: 0.25rem;
            margin-right: 0.25rem;
          }
          .space-y-6 > * + * {
            margin-top: 1rem;
          }
          .space-y-4 > * + * {
            margin-top: 0.75rem;
          }
          .p-4 {
            padding: 0.75rem;
          }
          .p-3 {
            padding: 0.5rem;
          }
          .text-3xl {
            font-size: 1.5rem;
          }
          .text-2xl {
            font-size: 1.25rem;
          }
          .text-xl {
            font-size: 1rem;
          }
          .text-lg {
            font-size: 0.875rem;
          }
          .text-base {
            font-size: 0.75rem;
          }
          .text-sm {
            font-size: 0.65rem;
          }
          .text-xs {
            font-size: 0.6rem;
          }
          .h-72 {
            height: 12rem; /* Reduced chart height */
          }
          .h-56 {
            height: 10rem;
          }
          .gap-6 {
            gap: 1rem;
          }
          .gap-4 {
            gap: 0.75rem;
          }
          .gap-3 {
            gap: 0.5rem;
          }
          .gap-2 {
            gap: 0.25rem;
          }
          .mb-6 {
            margin-bottom: 1rem;
          }
          .mb-4 {
            margin-bottom: 0.75rem;
          }
          .mb-3 {
            margin-bottom: 0.5rem;
          }
          .space-y-3 > * + * {
            margin-top: 0.5rem;
          }
          .space-y-2 > * + * {
            margin-top: 0.25rem;
          }
          .grid-cols-2 {
            grid-template-columns: 1fr; /* Stack columns on mobile */
          }
          .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr); /* 2 columns on mobile */
          }
          .w-10 {
            width: 2rem;
            height: 2rem;
          }
          .w-8 {
            width: 1.5rem;
            height: 1.5rem;
          }
          .w-6 {
            width: 1.25rem;
            height: 1.25rem;
          }
          .h-6 {
            height: 1rem;
            width: 1rem;
          }
          .h-5 {
            height: 0.875rem;
            width: 0.875rem;
          }
          .h-4 {
            height: 0.75rem;
            width: 0.75rem;
          }
          .max-w-[200px] {
            max-width: 120px;
          }
          .max-w-[150px] {
            max-width: 100px;
          }
          .px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          .py-2 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .px-3 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          .py-1 {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }
          .p-2 {
            padding: 0.375rem;
          }
          .p-1\.5 {
            padding: 0.25rem;
          }
          /* Chart adjustments */
          .recharts-tooltip-wrapper {
            font-size: 10px !important;
          }
          .recharts-bar-rectangles rect {
            width: 10px !important; /* Smaller bars */
          }
          .recharts-cartesian-axis-tick text {
            font-size: 8px !important; /* Smaller axis labels */
          }
        }

        /* Adjustments for Very Small Screens (e.g., <400px) */
        @media (max-width: 400px) {
          .text-2xl {
            font-size: 1.125rem;
          }
          .text-lg {
            font-size: 0.875rem;
          }
          .text-base {
            font-size: 0.65rem;
          }
          .text-sm {
            font-size: 0.6rem;
          }
          .text-xs {
            font-size: 0.55rem;
          }
          .h-48 {
            height: 10rem;
          }
          .max-w-[120px] {
            max-width: 80px;
          }
          .max-w-[100px] {
            max-width: 70px;
          }
          .w-6 {
            width: 1rem;
            height: 1rem;
          }
          .h-4 {
            height: 0.65rem;
            width: 0.65rem;
          }
          .px-2 {
            padding-left: 0.375rem;
            padding-right: 0.375rem;
          }
          .py-1 {
            padding-top: 0.125rem;
            padding-bottom: 0.125rem;
          }
          .grid-cols-4 {
            grid-template-columns: 1fr; /* Stack all cards on very small screens */
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;