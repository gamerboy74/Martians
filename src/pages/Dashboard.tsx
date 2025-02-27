import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Users, Swords, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
    revenue: 0
  });
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [recentTournaments, setRecentTournaments] = useState<any[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<any[]>([]);

  const fetchStats = async () => {
    try {
      // Fetch active tournaments count
      const { data: tournaments, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('id, status')
        .eq('status', 'ongoing');

      // Fetch total registrations
      const { count: registrationsCount, error: registrationsError } = await supabase
        .from('registrations')
        .select('id', { count: 'exact' });

      // Fetch completed matches
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('id, status')
        .eq('status', 'completed');

      if (!tournamentsError && !registrationsError && !matchesError) {
        setStats({
          activeTournaments: tournaments?.length || 0,
          totalRegistrations: registrationsCount || 0,
          matchesCompleted: matches?.length || 0,
          revenue: calculateRevenue(registrationsCount || 0) // Simple revenue calculation
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchActivityData = async () => {
    try {
      // Get data for the last 3 months
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 2);

      const months = [];
      for (let i = 0; i < 3; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        months.push(date.toLocaleString('default', { month: 'short' }));
      }

      const data = await Promise.all(months.map(async (month) => {
        const { data: tournaments } = await supabase
          .from('tournaments')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
          .lt('created_at', endDate.toISOString());

        const { data: registrations } = await supabase
          .from('registrations')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
          .lt('created_at', endDate.toISOString());

        const { data: matches } = await supabase
          .from('matches')
          .select('created_at')
          .gte('created_at', startDate.toISOString())
          .lt('created_at', endDate.toISOString());

        return {
          name: month,
          tournaments: tournaments?.length || 0,
          registrations: registrations?.length || 0,
          matches: matches?.length || 0
        };
      }));

      setActivityData(data);
    } catch (error) {
      console.error('Error fetching activity data:', error);
    }
  };

  const fetchRecentData = async () => {
    try {
      // Fetch recent tournaments
      const { data: tournaments } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent registrations
      const { data: registrations } = await supabase
        .from('registrations')
        .select(`
          *,
          tournaments (
            title
          )
        `)
        .order('created_at', { ascending: false })
        .limit(3);

      setRecentTournaments(tournaments || []);
      setRecentRegistrations(registrations || []);
    } catch (error) {
      console.error('Error fetching recent data:', error);
    }
  };

  const calculateRevenue = (registrations: number) => {
    // Simple revenue calculation (example: $10 per registration)
    return registrations * 10;
  };

  useEffect(() => {
    fetchStats();
    fetchActivityData();
    fetchRecentData();

    // Subscribe to real-time changes
    const tournamentsSubscription = supabase
      .channel('tournaments_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        () => {
          fetchStats();
          fetchActivityData();
          fetchRecentData();
        }
      )
      .subscribe();

    const registrationsSubscription = supabase
      .channel('registrations_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        () => {
          fetchStats();
          fetchActivityData();
          fetchRecentData();
        }
      )
      .subscribe();

    const matchesSubscription = supabase
      .channel('matches_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => {
          fetchStats();
          fetchActivityData();
        }
      )
      .subscribe();

    return () => {
      tournamentsSubscription.unsubscribe();
      registrationsSubscription.unsubscribe();
      matchesSubscription.unsubscribe();
    };
  }, []);

  const statCards = [
    {
      title: 'Active Tournaments',
      value: stats.activeTournaments.toString(),
      change: '+20%',
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Registrations',
      value: stats.totalRegistrations.toString(),
      change: '+15%',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Matches Completed',
      value: stats.matchesCompleted.toString(),
      change: '+12%',
      icon: Swords,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Revenue Generated',
      value: `$${stats.revenue}`,
      change: '+25%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-lg shadow p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-600">{stat.title}</h2>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Activity Overview</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tournaments" name="Tournaments" fill="#8B5CF6" />
              <Bar dataKey="registrations" name="Registrations" fill="#3B82F6" />
              <Bar dataKey="matches" name="Matches" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Tournaments</h2>
          <div className="space-y-4">
            {recentTournaments.map((tournament) => (
              <div key={tournament.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{tournament.title}</h3>
                    <p className="text-sm text-gray-600">
                      {tournament.current_participants}/{tournament.max_participants} Participants
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium ${
                  tournament.status === 'ongoing' 
                    ? 'text-green-700 bg-green-100' 
                    : 'text-purple-700 bg-purple-100'
                } rounded-full`}>
                  {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Registrations</h2>
          <div className="space-y-4">
            {recentRegistrations.map((registration) => (
              <div key={registration.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  {registration.logo_url ? (
                    <img
                      src={registration.logo_url}
                      alt={registration.team_name}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{registration.team_name}</h3>
                    <p className="text-sm text-gray-600">{registration.tournaments?.title}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium ${
                  registration.status === 'approved' 
                    ? 'text-green-700 bg-green-100' 
                    : 'text-yellow-700 bg-yellow-100'
                } rounded-full`}>
                  {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
