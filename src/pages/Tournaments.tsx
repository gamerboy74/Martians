import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Users, Plus, Search } from 'lucide-react';
import { Dialog } from '../components/ui/Dialog';
import { TournamentForm } from '../components/ui/TournamentForm';
import { Button } from '../components/ui/Button';
import { useTournamentStore } from '../stores/tournamentStore';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { FaRupeeSign } from 'react-icons/fa';

interface RegistrationCount {
  [key: string]: {
    approved: number;
    pending: number;
    total: number;
  }
}

const Tournaments: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [registrationCounts, setRegistrationCounts] = useState<RegistrationCount>({});
  const { tournaments, loading, fetchTournaments, createTournament, subscribeToTournaments } = useTournamentStore();
  const [searchTerm, setSearchTerm] = useState('');
  const toast = useToast();

  const fetchRegistrationCounts = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('tournament_id, status');

      if (error) throw error;

      const counts: RegistrationCount = {};
      data.forEach(registration => {
        if (!counts[registration.tournament_id]) {
          counts[registration.tournament_id] = {
            approved: 0,
            pending: 0,
            total: 0
          };
        }
        counts[registration.tournament_id].total++;
        if (registration.status === 'approved') {
          counts[registration.tournament_id].approved++;
        } else if (registration.status === 'pending') {
          counts[registration.tournament_id].pending++;
        }
      });

      setRegistrationCounts(counts);
    } catch (error) {
      console.error('Error fetching registration counts:', error);
    }
  };

  useEffect(() => {
    fetchTournaments();
    fetchRegistrationCounts();
    const unsubscribe = subscribeToTournaments();

    // Subscribe to registration changes
    const subscription = supabase
      .channel('registrations_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        () => {
          fetchRegistrationCounts();
        }
      )
      .subscribe();

    return () => {
      unsubscribe();
      subscription.unsubscribe();
    };
  }, []);

  const handleCreateTournament = async (data: any) => {
    try {
      await createTournament({
        ...data,
        status: 'upcoming',
        current_participants: 0
      });
      setIsDialogOpen(false);
      toast.success('Tournament created successfully');
    } catch (error) {
      toast.error('Failed to create tournament');
    }
  };

  const filteredTournaments = tournaments.filter(tournament =>
    tournament.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tournament.game.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Tournaments</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search tournaments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            leftIcon={<Plus className="h-5 w-5" />}
            className="w-full sm:w-auto"
          >
            Add Tournament
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-full p-6 space-y-4">
              {filteredTournaments.map((tournament) => (
                <Link
                  key={tournament.id}
                  to={`/admin/tournaments/${tournament.id}`}
                  className="block bg-gray-50 rounded-lg p-4 sm:p-6 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Trophy className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h2 className="text-lg font-medium text-gray-900">{tournament.title}</h2>
                        <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{formatDate(tournament.start_date)}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>
                              {registrationCounts[tournament.id]?.approved || 0}/
                              {tournament.max_participants} (
                              {registrationCounts[tournament.id]?.pending || 0} pending)
                            </span>
                          </div>
                          <div className="flex items-center">
                            <FaRupeeSign className="h-4 w-4 mr-1" />
                            <span>{tournament.prize_pool}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        tournament.status === 'upcoming'
                          ? 'text-purple-700 bg-purple-100'
                          : tournament.status === 'ongoing'
                          ? 'text-green-700 bg-green-100'
                          : 'text-gray-700 bg-gray-100'
                      }`}>
                        {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        tournament.registration_open
                          ? 'text-green-700 bg-green-100'
                          : 'text-red-700 bg-red-100'
                      }`}>
                        {tournament.registration_open ? 'Registration Open' : 'Registration Closed'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Create Tournament"
      >
        <TournamentForm
          onSubmit={handleCreateTournament}
          isLoading={loading}
        />
      </Dialog>
    </div>
  );
};

export default Tournaments;