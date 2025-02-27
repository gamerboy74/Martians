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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-fade-in">
            Tournament Results
          </h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 sm:py-3 rounded-xl bg-white/95 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 placeholder:text-gray-400 transition-all duration-300 hover:shadow-lg"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform duration-300 hover:scale-110" />
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
              leftIcon={<Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />}
              className="group w-full sm:w-auto px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
            >
              Add Result
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-4 border-b-4 border-purple-600"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-purple-700 opacity-60"></div>
              <div className="absolute inset-0 animate-pulse rounded-full h-10 w-10 sm:h-12 sm:w-12 bg-purple-500/20"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className="bg-white/95 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200/50 transform hover:-translate-y-1"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {result.logo_url ? (
                        <img
                          src={result.logo_url}
                          alt={result.team_name}
                          className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover shadow-sm hover:brightness-110 transition-all duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/64?text=Team';
                          }}
                        />
                      ) : (
                        <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-md animate-pulse-slow">
                          <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-white transition-transform duration-300 hover:scale-110" />
                        </div>
                      )}
                      <div className="truncate">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{result.team_name}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Medal className="h-4 w-4 text-purple-600 transition-transform duration-300 hover:scale-110" />
                            <span>Total Points: <span className="font-semibold">{result.total_points}</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-purple-600 transition-transform duration-300 hover:scale-110" />
                            <span>Win Rate: <span className="font-semibold">{((result.wins / result.matches_played) * 100).toFixed(1)}%</span></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(result)}
                        className="group w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 text-purple-600 rounded-full shadow-md hover:bg-purple-100 hover:text-purple-900 transition-all duration-300"
                        leftIcon={<Edit className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(result.id)}
                        className="group w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 text-red-600 rounded-full shadow-md hover:bg-red-100 hover:text-red-900 transition-all duration-300"
                        leftIcon={<Trash2 className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-purple-50 rounded-lg p-3 sm:p-4 shadow-sm">
                      <div className="text-xs sm:text-sm font-medium text-gray-500">Survival Points</div>
                      <div className="mt-1 text-lg sm:text-2xl font-semibold text-gray-900">{result.survival_points}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 sm:p-4 shadow-sm">
                      <div className="text-xs sm:text-sm font-medium text-gray-500">Kill Points</div>
                      <div className="mt-1 text-lg sm:text-2xl font-semibold text-gray-900">{result.kill_points}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 sm:p-4 shadow-sm">
                      <div className="text-xs sm:text-sm font-medium text-gray-500">Matches Played</div>
                      <div className="mt-1 text-lg sm:text-2xl font-semibold text-gray-900">{result.matches_played}</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 sm:p-4 shadow-sm">
                      <div className="text-xs sm:text-sm font-medium text-gray-500">Wins</div>
                      <div className="mt-1 text-lg sm:text-2xl font-semibold text-gray-900">{result.wins}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Dialog */}
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
          className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-2xl max-w-md mx-auto p-4 sm:p-6 border border-gray-200/50 transform transition-all duration-300 ease-in-out scale-95 hover:scale-100"
        >
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">Tournament</label>
              <select
                value={formData.tournament_id}
                onChange={(e) => {
                  setFormData({ 
                    ...formData, 
                    tournament_id: e.target.value,
                    team_id: ''
                  });
                }}
                className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
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
              <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">Team</label>
              <select
                value={formData.team_id}
                onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                className="px-3 sm:px-4 py-1 sm:py-2 text-gray-700 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 hover:text-gray-900 transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                leftIcon={<Save className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />}
                className="group px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
              >
                {editingResult ? 'Update' : 'Save'} Result
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
          .w-16 {
            width: 2.5rem;
            height: 2.5rem;
          }
          .h-12 {
            height: 2rem;
            width: 2rem;
          }
          .gap-6 {
            gap: 1rem;
          }
          .w-64 {
            width: 100%;
          }
          .py-3 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          .text-2xl {
            font-size: 1.25rem;
          }
          .max-w-md {
            max-width: 100%;
          }
          .gap-4 {
            gap: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ResultsManagement;