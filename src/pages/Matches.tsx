import React, { useState, useEffect } from 'react';
import { Swords, Plus, Search, ArrowUpRight, RefreshCw, Trophy, Trash2, Edit } from 'lucide-react';
import { Dialog } from '../components/ui/Dialog';
import { MatchForm } from '../components/ui/MatchForm';
import { Button } from '../components/ui/Button';
import { useMatchStore } from '../stores/matchStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { useRegistrationStore } from '../stores/registrationStore';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../lib/utils';
import { supabase } from '../lib/supabase';

const EditMatchModal: React.FC<{
  match: any;
  onClose: () => void;
  onUpdate: () => void;
}> = ({ match, onClose, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const updateData = {
        start_time: data.start_time,
        stream_url: data.stream_url,
        status: data.status,
        team1_score: data.team1_score,
        team2_score: data.team2_score,
      };

      const { error } = await supabase
        .from("matches")
        .update(updateData)
        .eq("id", match.id);

      if (error) throw error;

      toast.success("Match updated successfully");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating match:", error);
      toast.error("Failed to update match");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={true}
      onClose={onClose}
      title="Edit Match"
      className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-2xl max-w-md mx-auto p-4 sm:p-6 border border-gray-200/50 transform transition-all duration-300 ease-in-out scale-95 hover:scale-100"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleSubmit({
          start_time: formData.get("start_time"),
          stream_url: formData.get("stream_url"),
          status: formData.get("status"),
          team1_score: Number(formData.get("team1_score")),
          team2_score: Number(formData.get("team2_score")),
        });
      }}>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">Start Time</label>
            <input
              type="datetime-local"
              name="start_time"
              defaultValue={match.start_time.slice(0, 16)}
              className="w-full pl-3 pr-4 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 transition-all duration-300 hover:shadow-lg"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">Stream URL</label>
            <input
              type="url"
              name="stream_url"
              defaultValue={match.stream_url || ""}
              className="w-full pl-3 pr-4 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 transition-all duration-300 hover:shadow-lg"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">Status</label>
            <select
              name="status"
              defaultValue={match.status}
              className="w-full pl-3 pr-4 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 transition-all duration-300 hover:shadow-lg"
            >
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">{match.team1.team_name} Score</label>
              <input
                type="number"
                name="team1_score"
                defaultValue={match.team1_score}
                className="w-full pl-3 pr-4 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 transition-all duration-300 hover:shadow-lg"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 animate-slide-in">{match.team2.team_name} Score</label>
              <input
                type="number"
                name="team2_score"
                defaultValue={match.team2_score}
                className="w-full pl-3 pr-4 py-2 sm:py-3 rounded-xl bg-white/90 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 transition-all duration-300 hover:shadow-lg"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-6 flex justify-end gap-3 sm:gap-4">
          <Button
            onClick={onClose}
            variant="ghost"
            className="px-3 sm:px-4 py-1 sm:py-2 text-gray-700 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 hover:text-gray-900 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            leftIcon={isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
            className="px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

const Matches: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMatch, setEditingMatch] = useState<any | null>(null);
  const { matches, loading, fetchMatches, createMatch, subscribeToMatches } = useMatchStore();
  const { tournaments, fetchTournaments } = useTournamentStore();
  const { registrations, fetchRegistrations } = useRegistrationStore();
  const toast = useToast();

  useEffect(() => {
    fetchMatches();
    fetchTournaments();
    fetchRegistrations();
    const unsubscribe = subscribeToMatches();
    return () => unsubscribe();
  }, []);

  const handleCreateMatch = async (data: any) => {
    try {
      await createMatch(data);
      setIsDialogOpen(false);
      toast.success('Match created successfully');
    } catch (error) {
      toast.error('Failed to create match');
    }
  };

  const handleUpdateScore = async (matchId: string, team1Score: number, team2Score: number) => {
    try {
      await supabase
        .from('matches')
        .update({
          team1_score: team1Score,
          team2_score: team2Score,
          status: 'live'
        })
        .eq('id', matchId);

      toast.success('Match scores updated');
      fetchMatches();
    } catch (error) {
      toast.error('Failed to update match scores');
    }
  };

  const handleCompleteMatch = async (matchId: string) => {
    try {
      await supabase
        .from('matches')
        .update({
          status: 'completed'
        })
        .eq('id', matchId);

      toast.success('Match marked as completed');
      fetchMatches();
    } catch (error) {
      toast.error('Failed to complete match');
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;

    try {
      await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      toast.success('Match deleted successfully');
      fetchMatches();
    } catch (error) {
      toast.error('Failed to delete match');
    }
  };

  const filteredMatches = matches.filter(match =>
    match.tournaments?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-fade-in">
            Matches
          </h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Search matches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 sm:py-3 rounded-xl bg-white/95 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 placeholder:text-gray-400 transition-all duration-300 hover:shadow-lg"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform duration-300 hover:scale-110" />
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              leftIcon={<Plus className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />}
              className="group w-full sm:w-auto px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
            >
              Add Match
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
            {filteredMatches.map((match) => (
              <div
                key={match.id}
                className="bg-white/95 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200/50 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-4 sm:px-6 py-3 sm:py-4 border-b border-purple-100/50">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                        {match.tournaments?.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xs sm:text-sm text-gray-600">
                        {formatDate(match.start_time)}
                      </span>
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                        match.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        match.status === 'live' ? 'bg-green-100 text-green-800 animate-pulse' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {match.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className="mb-3 sm:mb-4">
                        {match.team1?.logo_url ? (
                          <img 
                            src={match.team1.logo_url}
                            alt={match.team1.team_name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-purple-500/50 shadow-sm hover:brightness-110 transition-all duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/64?text=T1';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center border-2 border-purple-500/50 shadow-md animate-pulse-slow">
                            <span className="text-lg sm:text-xl font-bold text-white">{match.team1?.team_name?.[0] || 'T1'}</span>
                          </div>
                        )}
                        <h4 className="mt-2 text-sm sm:text-base font-medium text-gray-900 truncate">{match.team1?.team_name || 'Team 1'}</h4>
                      </div>
                      {match.status !== 'completed' ? (
                        <input
                          type="number"
                          value={match.team1_score}
                          onChange={(e) => handleUpdateScore(match.id, parseInt(e.target.value), match.team2_score)}
                          className="w-16 sm:w-20 px-2 sm:px-3 py-1 sm:py-2 text-center text-xl sm:text-2xl font-bold border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white/90 hover:shadow-lg transition-all duration-300"
                          min="0"
                        />
                      ) : (
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">{match.team1_score}</span>
                      )}
                    </div>

                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 flex items-center justify-center shadow-md">
                        <Swords className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 transition-transform duration-300 hover:scale-110" />
                      </div>
                    </div>

                    <div className="flex flex-col items-center text-center flex-1">
                      <div className="mb-3 sm:mb-4">
                        {match.team2?.logo_url ? (
                          <img 
                            src={match.team2.logo_url}
                            alt={match.team2.team_name}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-purple-500/50 shadow-sm hover:brightness-110 transition-all duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/64?text=T2';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center border-2 border-purple-500/50 shadow-md animate-pulse-slow">
                            <span className="text-lg sm:text-xl font-bold text-white">{match.team2?.team_name?.[0] || 'T2'}</span>
                          </div>
                        )}
                        <h4 className="mt-2 text-sm sm:text-base font-medium text-gray-900 truncate">{match.team2?.team_name || 'Team 2'}</h4>
                      </div>
                      {match.status !== 'completed' ? (
                        <input
                          type="number"
                          value={match.team2_score}
                          onChange={(e) => handleUpdateScore(match.id, match.team1_score, parseInt(e.target.value))}
                          className="w-16 sm:w-20 px-2 sm:px-3 py-1 sm:py-2 text-center text-xl sm:text-2xl font-bold border rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white/90 hover:shadow-lg transition-all duration-300"
                          min="0"
                        />
                      ) : (
                        <span className="text-2xl sm:text-3xl font-bold text-gray-900">{match.team2_score}</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-end gap-2 sm:gap-4">
                    {match.stream_url && (
                      <a
                        href={match.stream_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 flex items-center justify-center gap-2 border border-purple-300 rounded-full text-xs sm:text-sm font-medium text-purple-700 bg-white/90 shadow-md hover:bg-purple-50 hover:shadow-lg transition-all duration-300"
                      >
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
                        Watch Stream
                      </a>
                    )}
                    {match.status === 'live' && (
                      <Button
                        onClick={() => handleCompleteMatch(match.id)}
                        leftIcon={<Trophy className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
                        className="group w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full shadow-md hover:from-green-600 hover:to-teal-600 hover:shadow-lg transition-all duration-300"
                      >
                        Complete
                      </Button>
                    )}
                    <Button
                      onClick={() => setEditingMatch(match)}
                      leftIcon={<Edit className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
                      variant="ghost"
                      className="group w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 text-gray-700 rounded-full shadow-md hover:bg-gray-100 hover:text-gray-900 transition-all duration-300"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteMatch(match.id)}
                      leftIcon={<Trash2 className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
                      variant="ghost"
                      className="group w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 text-red-600 rounded-full shadow-md hover:bg-red-100 hover:text-red-900 transition-all duration-300"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Create Match"
          className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-2xl max-w-md mx-auto p-4 sm:p-6 border border-gray-200/50 transform transition-all duration-300 ease-in-out scale-95 hover:scale-100"
        >
          <MatchForm
            onSubmit={handleCreateMatch}
            tournaments={tournaments}
            isLoading={loading}
          />
        </Dialog>

        {editingMatch && (
          <EditMatchModal
            match={editingMatch}
            onClose={() => setEditingMatch(null)}
            onUpdate={fetchMatches}
          />
        )}
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
          .w-20 {
            width: 4rem;
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
        }
      `}</style>
    </div>
  );
};

export default Matches;