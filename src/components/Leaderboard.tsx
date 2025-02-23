import React, { useState, useEffect } from 'react';
import { Trophy, Users, Monitor, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardEntry {
  id: string;
  team_id: string;
  team_name: string;
  logo_url?: string;
  survival_points: number;
  kill_points: number;
  total_points: number;
  matches_played: number;
  wins: number;
}

const Leaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'all-time'>('all-time');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select(`
          *,
          teams:registrations!team_id (
            team_name,
            logo_url
          )
        `)
        .order('total_points', { ascending: false });

      if (error) throw error;

      const formattedData = data.map(entry => ({
        id: entry.id,
        team_id: entry.team_id,
        team_name: entry.teams.team_name,
        logo_url: entry.teams.logo_url,
        survival_points: entry.survival_points,
        kill_points: entry.kill_points,
        total_points: entry.total_points,
        matches_played: entry.matches_played,
        wins: entry.wins
      }));

      setLeaderboard(formattedData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();

    const subscription = supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leaderboard' },
        () => {
          fetchLeaderboard();
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
    <section id="leaderboard" className="min-h-screen bg-black px-4 sm:px-8 py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            LEADERBOARD
          </h2>
          <div className="flex justify-center gap-2 mt-8 flex-wrap px-4">
            {(['weekly', 'monthly', 'all-time'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  timeframe === t
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-500/20 text-gray-300 hover:bg-purple-500/30'
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-12 bg-purple-900/20 backdrop-blur-sm rounded-xl">
            <Trophy className="mx-auto h-16 w-16 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Rankings Yet</h3>
            <p className="text-gray-400 max-w-md mx-auto px-4">
              The leaderboard is currently empty. Rankings will be updated as tournaments progress and matches are completed.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className="relative overflow-hidden bg-purple-900/20 backdrop-blur-sm rounded-lg 
                  transform transition-all duration-500"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent opacity-50" />
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 via-purple-400 to-purple-500" />
                
                <div className="relative p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative">
                        <div className="absolute inset-0 bg-purple-500/10 rounded-full blur-md" />
                        {entry.logo_url ? (
                          <img 
                            src={entry.logo_url}
                            alt={entry.team_name}
                            className="relative w-16 h-16 rounded-full object-cover ring-2 ring-purple-500/20"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/64?text=Logo';
                            }}
                          />
                        ) : (
                          <div className="relative w-16 h-16 rounded-full bg-purple-900/50 flex items-center justify-center ring-2 ring-purple-500/20">
                            {index === 0 ? (
                              <Trophy className="w-8 h-8 text-yellow-400" />
                            ) : index === 1 ? (
                              <Trophy className="w-8 h-8 text-gray-400" />
                            ) : index === 2 ? (
                              <Trophy className="w-8 h-8 text-orange-400" />
                            ) : (
                              <Trophy className="w-8 h-8 text-purple-400" />
                            )}
                          </div>
                        )}
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-purple-600 
                          flex items-center justify-center text-white font-bold text-sm border-2 border-black">
                          #{index + 1}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{entry.team_name}</h3>
                        <div className="flex items-center gap-2 text-purple-400">
                          <Trophy size={16} />
                          <span>{entry.total_points} Points</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full sm:flex-1">
                      <div className="text-center p-2 bg-purple-900/30 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-white">{entry.survival_points}</div>
                        <div className="text-xs sm:text-sm text-gray-400">Survival Points</div>
                      </div>
                      <div className="text-center p-2 bg-purple-900/30 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold text-white">{entry.kill_points}</div>
                        <div className="text-xs sm:text-sm text-gray-400">Kill Points</div>
                      </div>
                      <div className="text-center p-2 bg-purple-900/30 rounded-lg col-span-2 sm:col-span-1">
                        <div className="text-lg sm:text-2xl font-bold text-white">
                          {((entry.wins / entry.matches_played) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">Win Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </section>
  );
};

export default Leaderboard;