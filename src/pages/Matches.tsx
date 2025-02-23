import React, { useState, useEffect } from 'react';
import { Swords, Plus, Search, ArrowUpRight, RefreshCw, Trophy } from 'lucide-react';
import { Dialog } from '../components/ui/Dialog';
import { MatchForm } from '../components/ui/MatchForm';
import { Button } from '../components/ui/Button';
import { useMatchStore } from '../stores/matchStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { useRegistrationStore } from '../stores/registrationStore';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../lib/utils';
import { supabase } from '../lib/supabase';

const Matches: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredMatches = matches.filter(match =>
    match.tournaments?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            leftIcon={<Plus className="h-5 w-5" />}
            className="w-full sm:w-auto"
          >
            Add Match
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="bg-purple-50 px-4 sm:px-6 py-4 border-b border-purple-100">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-medium text-gray-900">{match.tournaments?.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {formatDate(match.start_time)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="mb-4">
                      {match.team1?.logo_url ? (
                        <img 
                          src={match.team1.logo_url}
                          alt={match.team1.team_name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/64?text=T1';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-purple-900/50 flex items-center justify-center border-2 border-purple-500/30">
                          <span className="text-xl font-bold text-white">{match.team1?.team_name?.[0] || 'T1'}</span>
                        </div>
                      )}
                      <h4 className="mt-2 font-medium text-gray-900">{match.team1?.team_name || 'Team 1'}</h4>
                    </div>
                    {match.status !== 'completed' ? (
                      <input
                        type="number"
                        value={match.team1_score}
                        onChange={(e) => handleUpdateScore(match.id, parseInt(e.target.value), match.team2_score)}
                        className="w-20 px-3 py-2 text-center text-2xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                        min="0"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">{match.team1_score}</span>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <Swords className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center flex-1">
                    <div className="mb-4">
                      {match.team2?.logo_url ? (
                        <img 
                          src={match.team2.logo_url}
                          alt={match.team2.team_name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/64?text=T2';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-purple-900/50 flex items-center justify-center border-2 border-purple-500/30">
                          <span className="text-xl font-bold text-white">{match.team2?.team_name?.[0] || 'T2'}</span>
                        </div>
                      )}
                      <h4 className="mt-2 font-medium text-gray-900">{match.team2?.team_name || 'Team 2'}</h4>
                    </div>
                    {match.status !== 'completed' ? (
                      <input
                        type="number"
                        value={match.team2_score}
                        onChange={(e) => handleUpdateScore(match.id, match.team1_score, parseInt(e.target.value))}
                        className="w-20 px-3 py-2 text-center text-2xl font-bold border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 bg-white"
                        min="0"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-gray-900">{match.team2_score}</span>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-4">
                  {match.stream_url && (
                    <a
                      href={match.stream_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2 flex items-center justify-center gap-2 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 transition-colors"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      Watch Stream
                    </a>
                  )}
                  {match.status === 'live' && (
                    <Button
                      onClick={() => handleCompleteMatch(match.id)}
                      leftIcon={<Trophy className="h-4 w-4" />}
                      className="w-full sm:w-auto"
                    >
                      Complete Match
                    </Button>
                  )}
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
      >
        <MatchForm
          onSubmit={handleCreateMatch}
          tournaments={tournaments}
          isLoading={loading}
        />
      </Dialog>
    </div>
  );
};

export default Matches;