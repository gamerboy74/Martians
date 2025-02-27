import React, { useState, useEffect } from 'react';
import { Medal, Trophy, Target, Award, Plus, Edit, Trash2, Users, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';

interface Team {
  id: string;
  team_name: string;
  logo_url?: string;
}

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
  win_rate: number;
}

interface PointsFormData {
  team_id: string;
  survival_points: number;
  kill_points: number;
  matches_played: number;
  wins: number;
}

const Leaderboard: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [approvedTeams, setApprovedTeams] = useState<Team[]>([]);
  const [formData, setFormData] = useState<PointsFormData>({
    team_id: '',
    survival_points: 0,
    kill_points: 0,
    matches_played: 0,
    wins: 0
  });
  const [editingEntry, setEditingEntry] = useState<LeaderboardEntry | null>(null);
  const toast = useToast();

  const calculateWinRate = (wins: number, matches: number): number => {
    if (matches === 0) return 0;
    return (wins / matches) * 100;
  };

  const fetchApprovedTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('id, team_name, logo_url')
        .eq('status', 'approved')
        .order('team_name');

      if (error) throw error;
      setApprovedTeams(data || []);
    } catch (error) {
      console.error('Error fetching approved teams:', error);
      toast.error('Failed to fetch teams');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
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
        wins: entry.wins,
        win_rate: calculateWinRate(entry.wins, entry.matches_played)
      }));

      setLeaderboard(formattedData);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast.error('Failed to fetch leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    fetchApprovedTeams();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const total_points = formData.survival_points + formData.kill_points;
      
      if (editingEntry) {
        const { error } = await supabase
          .from('leaderboard')
          .update({
            survival_points: formData.survival_points,
            kill_points: formData.kill_points,
            total_points,
            matches_played: formData.matches_played,
            wins: formData.wins
          })
          .eq('id', editingEntry.id);

        if (error) throw error;
        toast.success('Points updated successfully');
      } else {
        const { error } = await supabase
          .from('leaderboard')
          .insert([{
            team_id: formData.team_id,
            survival_points: formData.survival_points,
            kill_points: formData.kill_points,
            total_points,
            matches_played: formData.matches_played,
            wins: formData.wins
          }]);

        if (error) throw error;
        toast.success('Points added successfully');
      }

      setIsFormOpen(false);
      setEditingEntry(null);
      setFormData({
        team_id: '',
        survival_points: 0,
        kill_points: 0,
        matches_played: 0,
        wins: 0
      });
      fetchLeaderboard();
    } catch (error) {
      console.error('Error saving points:', error);
      toast.error('Failed to save points');
    }
  };

  const handleEdit = (entry: LeaderboardEntry) => {
    setEditingEntry(entry);
    setFormData({
      team_id: entry.team_id,
      survival_points: entry.survival_points,
      kill_points: entry.kill_points,
      matches_played: entry.matches_played,
      wins: entry.wins
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const { error } = await supabase
        .from('leaderboard')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Entry deleted successfully');
      fetchLeaderboard();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-b-4 border-purple-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-purple-700 opacity-60"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-purple-500/20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-fade-in">
            Leaderboard
          </h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
              className="w-full sm:w-auto px-3 py-2 sm:py-3 rounded-xl bg-white/95 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
            >
              <option value="all">All Time</option>
              <option value="month">This Month</option>
              <option value="week">This Week</option>
            </select>
            <Button
              onClick={() => {
                setEditingEntry(null);
                setFormData({ team_id: '', survival_points: 0, kill_points: 0, matches_played: 0, wins: 0 });
                setIsFormOpen(true);
              }}
              leftIcon={<Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />}
              className="group w-full sm:w-auto px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
            >
              Add Points
            </Button>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {leaderboard.slice(0, 3).map((entry, index) => {
            const Icon = index === 0 ? Trophy : index === 1 ? Medal : Award;
            const colors = [
              { icon: 'text-yellow-600', bg: 'bg-yellow-100' },
              { icon: 'text-gray-600', bg: 'bg-gray-100' },
              { icon: 'text-orange-600', bg: 'bg-orange-100' },
            ];
            return (
              <div
                key={entry.id}
                className="bg-white/95 rounded-xl shadow-md p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4 hover:shadow-xl transition-all duration-300 border border-gray-200/50 transform hover:-translate-y-1"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 ${colors[index].bg} rounded-lg flex items-center justify-center shadow-sm`}>
                  {entry.logo_url ? (
                    <img
                      src={entry.logo_url}
                    alt={entry.team_name}
                    className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg object-cover hover:brightness-110 transition-all duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/48?text=Logo';
                    }}
                    />
                  ) : (
                    <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${colors[index].icon} transition-transform duration-300 hover:scale-110`} />
                  )}
                </div>
                <div className="truncate">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{entry.team_name}</h3>
                  <div className="mt-1 text-xs sm:text-sm text-gray-600">
                    <div>Total Points: <span className="font-semibold">{entry.total_points}</span></div>
                    <div>Win Rate: <span className="font-semibold">{entry.win_rate.toFixed(1)}%</span></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Leaderboard List */}
        <div className="bg-white/95 shadow-lg rounded-xl overflow-hidden border border-gray-200/50">
          <div className="overflow-x-auto">
            <div className="min-w-full divide-y divide-gray-200">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600 w-6 sm:w-8">#{index + 1}</div>
                      {entry.logo_url ? (
                        <img
                          src={entry.logo_url}
                          alt={entry.team_name}
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover shadow-sm hover:brightness-110 transition-all duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/48?text=Logo';
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md animate-pulse-slow">
                          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-300 hover:scale-110" />
                        </div>
                      )}
                      <div className="truncate">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{entry.team_name}</h3>
                        <div className="text-xs sm:text-sm text-gray-600">Total Points: <span className="font-semibold">{entry.total_points}</span></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 w-full sm:w-auto">
                      <div className="text-center p-2 bg-gray-50 rounded-lg shadow-sm">
                        <div className="text-xs sm:text-sm font-medium text-gray-500">Survival</div>
                        <div className="text-base sm:text-lg font-semibold text-gray-900">{entry.survival_points}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg shadow-sm">
                        <div className="text-xs sm:text-sm font-medium text-gray-500">Kills</div>
                        <div className="text-base sm:text-lg font-semibold text-gray-900">{entry.kill_points}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg shadow-sm">
                        <div className="text-xs sm:text-sm font-medium text-gray-500">Matches</div>
                        <div className="text-base sm:text-lg font-semibold text-gray-900">{entry.matches_played}</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg shadow-sm">
                        <div className="text-xs sm:text-sm font-medium text-gray-500">Wins</div>
                        <div className="text-base sm:text-lg font-semibold text-gray-900">{entry.wins}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(entry)}
                        className="group w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 text-purple-600 rounded-full shadow-md hover:bg-purple-100 hover:text-purple-900 transition-all duration-300"
                        leftIcon={<Edit className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(entry.id)}
                        className="group w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 text-red-600 rounded-full shadow-md hover:bg-red-100 hover:text-red-900 transition-all duration-300"
                        leftIcon={<Trash2 className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Dialog */}
        <Dialog
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingEntry(null);
            setFormData({ team_id: '', survival_points: 0, kill_points: 0, matches_played: 0, wins: 0 });
          }}
          title={editingEntry ? 'Edit Points' : 'Add Points'}
          className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-2xl max-w-md mx-auto p-4 sm:p-6 border border-gray-200/50 transform transition-all duration-300 ease-in-out scale-95 hover:scale-100"
        >
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">Team</label>
              <select
                value={formData.team_id}
                onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
                disabled={!!editingEntry}
              >
                <option value="">Select a team</option>
                {approvedTeams.map((team) => (
                  <option key={team.id} value={team.id}>{team.team_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">Survival Points</label>
              <input
                type="number"
                value={formData.survival_points}
                onChange={(e) => setFormData({ ...formData, survival_points: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">Kill Points</label>
              <input
                type="number"
                value={formData.kill_points}
                onChange={(e) => setFormData({ ...formData, kill_points: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">Matches Played</label>
              <input
                type="number"
                value={formData.matches_played}
                onChange={(e) => setFormData({ ...formData, matches_played: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">Wins</label>
              <input
                type="number"
                value={formData.wins}
                onChange={(e) => setFormData({ ...formData, wins: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
                min="0"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">Total Points</label>
              <input
                type="number"
                value={formData.survival_points + formData.kill_points}
                className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-gray-100 border border-gray-200 shadow-md text-gray-900 text-xs sm:text-sm"
                disabled
              />
            </div>

            <div className="mt-4 sm:mt-6 flex justify-end gap-2 sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingEntry(null);
                  setFormData({ team_id: '', survival_points: 0, kill_points: 0, matches_played: 0, wins: 0 });
                }}
                className="px-3 sm:px-4 py-1 sm:py-2 text-gray-700 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 hover:text-gray-900 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
              >
                {editingEntry ? 'Update' : 'Add'} Points
              </Button>
            </div>
          </form>
        </Dialog>
      </div>

      <style >{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-slow {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
        .animate-slide-in { animation: slide-in 0.5s ease-out; }
        .animate-pulse-slow { animation: pulse-slow 2s infinite ease-in-out; }

        /* Responsive Adjustments for Small Devices */
        @media (max-width: 640px) {
          .space-y-6 > * + * {
            margin-top: 1rem;
          }
          .p-6 {
            padding: 0.75rem;
          }
          .text-3xl {
            font-size: 1.5rem;
          }
          .text-lg {
            font-size: 1rem;
          }
          .text-sm {
            font-size: 0.75rem;
          }
          .text-xs {
            font-size: 0.65rem;
          }
          .w-12 {
            width: 2rem;
            height: 2rem;
          }
          .h-12 {
            height: 2rem;
            width: 2rem;
          }
          .gap-6 {
            gap: 1rem;
          }
          .mb-8 {
            margin-bottom: 1.5rem;
          }
          .w-16 {
            width: 2.5rem;
            height: 2.5rem;
          }
          .w-8 {
            width: 1.5rem;
          }
          .py-3 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          .max-w-md {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;