import React, { useState, useEffect } from 'react';
import { Plus, Search, Trophy, Edit, Trash2, Save, Medal, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { useToast } from '../hooks/useToast';

interface TeamResult {
  id: string;
  team_id: string;
  survival_points: number;
  kill_points: number;
  total_points: number;
  matches_played: number;
  wins: number;
  team_name?: string;
  logo_url?: string;
  registrations?: {
    tournament_id: string;
  };
}

interface Tournament {
  id: string;
  title: string;
}

interface FormData {
  tournament_id: string;
  team_id: string;
  survival_points: number;
  kill_points: number;
  matches_played: number;
  wins: number;
}

const ResultsManagement: React.FC = () => {
  const [results, setResults] = useState<TeamResult[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<{ id: string; team_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    tournament_id: '',
    team_id: '',
    survival_points: 0,
    kill_points: 0,
    matches_played: 0,
    wins: 0
  });
  const [editingResult, setEditingResult] = useState<TeamResult | null>(null);
  const toast = useToast();

  const fetchResults = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leaderboard')
        .select(`
          *,
          registrations!team_id (
            team_name,
            logo_url,
            tournament_id
          )
        `)
        .order('total_points', { ascending: false });

      if (error) throw error;

      const formattedResults = data.map(result => ({
        ...result,
        team_name: result.registrations?.team_name,
        logo_url: result.registrations?.logo_url
      }));

      setResults(formattedResults);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('id, title')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.error('Failed to fetch tournaments');
    }
  };

  const fetchTeamsForTournament = async (tournamentId: string) => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('id, team_name')
        .eq('tournament_id', tournamentId)
        .eq('status', 'approved')
        .order('team_name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to fetch teams');
    }
  };

  useEffect(() => {
    fetchResults();
    fetchTournaments();

    const subscription = supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leaderboard' },
        () => {
          fetchResults();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (formData.tournament_id) {
      fetchTeamsForTournament(formData.tournament_id);
    }
  }, [formData.tournament_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const total_points = formData.survival_points + formData.kill_points;

      if (editingResult) {
        const { error } = await supabase
          .from('leaderboard')
          .update({
            survival_points: formData.survival_points,
            kill_points: formData.kill_points,
            total_points,
            matches_played: formData.matches_played,
            wins: formData.wins,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingResult.id);

        if (error) throw error;
        toast.success('Results updated successfully');
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
        toast.success('Results added successfully');
      }

      setIsDialogOpen(false);
      setEditingResult(null);
      setFormData({
        tournament_id: '',
        team_id: '',
        survival_points: 0,
        kill_points: 0,
        matches_played: 0,
        wins: 0
      });
      fetchResults();
    } catch (error) {
      console.error('Error saving results:', error);
      toast.error('Failed to save results');
    }
  };

  const handleEdit = (result: TeamResult) => {
    setEditingResult(result);
    setFormData({
      tournament_id: result.registrations?.tournament_id || '',
      team_id: result.team_id,
      survival_points: result.survival_points,
      kill_points: result.kill_points,
      matches_played: result.matches_played,
      wins: result.wins
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;

    try {
      const { error } = await supabase
        .from('leaderboard')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Result deleted successfully');
      fetchResults();
    } catch (error) {
      console.error('Error deleting result:', error);
      toast.error('Failed to delete result');
    }
  };

  const filteredResults = results.filter(result =>
    result.team_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tournament Results</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <Button
            onClick={() => {
              setEditingResult(null);
              setFormData({
                tournament_id: '',
                team_id: '',
                survival_points: 0,
                kill_points: 0,
                matches_played: 0,
                wins: 0
               });
              setIsDialogOpen(true);
            }}
            leftIcon={<Plus className="h-5 w-5" />}
            className="w-full sm:w-auto"
          >
            Add Result
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredResults.map((result) => (
            <div
              key={result.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {result.logo_url ? (
                      <img
                        src={result.logo_url}
                        alt={result.team_name}
                        className="h-16 w-16 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/64?text=Team';
                        }}
                      />
                    ) : (
                      <div className="h-16 w-16 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-purple-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{result.team_name}</h3>
                      <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Medal className="h-4 w-4 text-purple-600" />
                          <span>Total Points: {result.total_points}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-600" />
                          <span>Win Rate: {((result.wins / result.matches_played) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(result)}
                      leftIcon={<Edit className="h-4 w-4" />}
                      className="w-full sm:w-auto"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(result.id)}
                      className="text-red-600 hover:text-red-900 w-full sm:w-auto"
                      leftIcon={<Trash2 className="h-4 w-4" />}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500">Survival Points</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">{result.survival_points}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500">Kill Points</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">{result.kill_points}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500">Matches Played</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">{result.matches_played}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-500">Wins</div>
                    <div className="mt-1 text-2xl font-semibold text-gray-900">{result.wins}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingResult(null);
          setFormData({
            tournament_id: '',
            team_id: '',
            survival_points: 0,
            kill_points: 0,
            matches_played: 0,
            wins: 0
          });
        }}
        title={editingResult ? 'Edit Result' : 'Add Result'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tournament</label>
            <select
              value={formData.tournament_id}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  tournament_id: e.target.value,
                  team_id: ''
                });
              }}
              className="mt-1 block w-full rounded-lg text-gray-900 border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              disabled={!!editingResult}
            >
              <option value="">Select Tournament</option>
              {tournaments.map((tournament) => (
                <option key={tournament.id} value={tournament.id}>
                  {tournament.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Team</label>
            <select
              value={formData.team_id}
              onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
              className="mt-1 block w-full rounded-lg text-gray-900 border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
              disabled={!formData.tournament_id || !!editingResult}
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.team_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Survival Points</label>
              <input
                type="number"
                value={formData.survival_points}
                onChange={(e) => setFormData({ ...formData, survival_points: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Kill Points</label>
              <input
                type="number"
                value={formData.kill_points}
                onChange={(e) => setFormData({ ...formData, kill_points: parseInt(e.target.value) || 0 })}
                className="mt-1 block text-gray-900 w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Matches Played</label>
              <input
                type="number"
                value={formData.matches_played}
                onChange={(e) => setFormData({ ...formData, matches_played: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full text-gray-900 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Wins</label>
              <input
                type="number"
                value={formData.wins}
                onChange={(e) => setFormData({ ...formData, wins: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-lg text-gray-900 border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Total Points</label>
            <input
              type="number"
              value={formData.survival_points + formData.kill_points}
              className="mt-1 block w-full text-gray-900 rounded-lg border-gray-300 bg-gray-50 shadow-sm"
              disabled
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsDialogOpen(false);
                setEditingResult(null);
                setFormData({
                  tournament_id: '',
                  team_id: '',
                  survival_points: 0,
                  kill_points: 0,
                  matches_played: 0,
                  wins: 0
                });
              }}
            >
              Cancel
            </Button>
            <Button type="submit" leftIcon={<Save className="h-5 w-5" />}>
              {editingResult ? 'Update' : 'Save'} Result
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default ResultsManagement;