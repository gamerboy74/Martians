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
      const win_rate = calculateWinRate(formData.wins, formData.matches_played);
      
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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
            className="w-full sm:w-auto border text-gray-900 border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent p-2"
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
            leftIcon={<Plus className="h-5 w-5" />}
            className="w-full sm:w-auto"
          >
            Add Points
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              className="bg-white rounded-lg shadow p-6 flex items-center space-x-4"
            >
              <div className={`w-16 h-16 ${colors[index].bg} rounded-lg flex items-center justify-center`}>
                {entry.logo_url ? (
                  <img
                    src={entry.logo_url}
                    alt={entry.team_name}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/48?text=Logo';
                    }}
                  />
                ) : (
                  <Icon className={`h-8 w-8 ${colors[index].icon}`} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{entry.team_name}</h3>
                <div className="mt-1 text-sm text-gray-600">
                  <div>Total Points: {entry.total_points}</div>
                  <div>Win Rate: {entry.win_rate.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className="p-4 sm:p-6  hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-purple-600 w-8">#{index + 1}</div>
                      {entry.logo_url ? (
                        <img
                          src={entry.logo_url}
                          alt={entry.team_name}
                          className="h-12 w-12 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/48?text=Logo';
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{entry.team_name}</h3>
                        <div className="text-sm text-gray-500">Total Points: {entry.total_points}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Survival</div>
                      <div className="text-lg font-semibold text-gray-900">{entry.survival_points}</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Kills</div>
                      <div className="text-lg font-semibold text-gray-900">{entry.kill_points}</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Matches</div>
                      <div className="text-lg font-semibold text-gray-900">{entry.matches_played}</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-500">Wins</div>
                      <div className="text-lg font-semibold text-gray-900">{entry.wins}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(entry)}
                      className="text-purple-600 hover:text-purple-900 flex-1 sm:flex-none"
                      leftIcon={<Edit className="h-4 w-4" />}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-900 flex-1 sm:flex-none"
                      leftIcon={<Trash2 className="h-4 w-4" />}
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

      <Dialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEntry(null);
          setFormData({ team_id: '', survival_points: 0, kill_points: 0, matches_played: 0, wins: 0 });
        }}
        title={editingEntry ? 'Edit Points' : 'Add Points'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Team</label>
            <select
              value={formData.team_id}
              onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
              className="mt-1 block w-full text-gray-900 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              disabled={!!editingEntry}
            >
              <option value="">Select a team</option>
              {approvedTeams.map((team) => (
                <option key={team.id} value={team.id}>{team.team_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Survival Points</label>
            <input
              type="number"
              value={formData.survival_points}
              onChange={(e) => setFormData({ ...formData, survival_points: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md text-gray-900 border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Kill Points</label>
            <input
              type="number"
              value={formData.kill_points}
              onChange={(e) => setFormData({ ...formData, kill_points: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md text-gray-900 border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Matches Played</label>
            <input
              type="number"
              value={formData.matches_played}
              onChange={(e) => setFormData({ ...formData, matches_played: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md text-gray-900 border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Wins</label>
            <input
              type="number"
              value={formData.wins}
              onChange={(e) => setFormData({ ...formData, wins: parseInt(e.target.value) || 0 })}
              className="mt-1 block w-full rounded-md text-gray-900 border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Total Points</label>
            <input
              type="number"
              value={formData.survival_points + formData.kill_points}
              className="mt-1 block w-full rounded-md text-gray-900 border-gray-300 shadow-sm bg-gray-50"
              disabled
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsFormOpen(false);
                setEditingEntry(null);
                setFormData({ team_id: '', survival_points: 0, kill_points: 0, matches_played: 0, wins: 0 });
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingEntry ? 'Update' : 'Add'} Points
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default Leaderboard;