import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Trophy, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { RegistrationDetailsDialog } from '../components/ui/RegistrationDetailsDialog';
import { useToast } from '../hooks/useToast';

interface Team {
  id: string;
  name: string;
  logo_url: string;
  created_at: string;
  registration: any; // Full registration data
}

const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const toast = useToast();

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id,
          team_name,
          logo_url,
          created_at,
          tournaments (
            title
          ),
          team_members,
          contact_info,
          game_details,
          tournament_preferences,
          status
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTeams = data?.map(registration => ({
        id: registration.id,
        name: registration.team_name,
        logo_url: registration.logo_url,
        created_at: registration.created_at,
        registration: registration
      })) || [];

      setTeams(formattedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();

    const subscription = supabase
      .channel('teams_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations',
          filter: 'status=eq.approved'
        },
        () => {
          fetchTeams();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleViewDetails = (team: Team) => {
    setSelectedTeam(team);
    setIsDetailsOpen(true);
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.registration.tournaments?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No teams found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No approved team registrations yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  {team.logo_url ? (
                    <img
                      src={team.logo_url}
                      alt={`${team.name} Logo`}
                      className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/64?text=No+Logo';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.registration.tournaments?.title}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{team.registration.team_members?.length || 0} members</span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => handleViewDetails(team)}
                    leftIcon={<Eye className="h-4 w-4" />}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <RegistrationDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        registration={selectedTeam?.registration}
      />
    </div>
  );
};

export default Teams;