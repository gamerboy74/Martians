import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Users, Edit, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Dialog } from '../components/ui/Dialog';
import { TournamentForm } from '../components/ui/TournamentForm';
import { Button } from '../components/ui/Button';
import { useTournamentStore } from '../stores/tournamentStore';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { FaRupeeSign } from 'react-icons/fa';

interface Registration {
  id: string;
  team_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  logo_url?: string;
  contact_info: {
    email: string;
    full_name: string;
  };
}

const TournamentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedTournament, getTournamentById, updateTournament, deleteTournament } = useTournamentStore();

  const fetchRegistrations = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('tournament_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getTournamentById(id);
      fetchRegistrations();

      // Subscribe to registration changes
      const subscription = supabase
        .channel('registration_changes')
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'registrations',
            filter: `tournament_id=eq.${id}`
          },
          () => {
            fetchRegistrations();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [id]);

  if (!selectedTournament) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const handleUpdate = async (data: any) => {
    try {
      await updateTournament(id!, data);
      setIsEditDialogOpen(false);
      toast.success('Tournament updated successfully');
    } catch (error) {
      toast.error('Failed to update tournament');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await deleteTournament(id!);
        toast.success('Tournament deleted successfully');
        navigate('/admin/tournaments');
      } catch (error) {
        toast.error('Failed to delete tournament');
      }
    }
  };

  const handleUpdateRegistrationStatus = async (registrationId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status })
        .eq('id', registrationId);

      if (error) throw error;
      toast.success(`Registration ${status} successfully`);
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating registration:', error);
      toast.error('Failed to update registration status');
    }
  };

  const approvedCount = registrations.filter(r => r.status === 'approved').length;
  const pendingCount = registrations.filter(r => r.status === 'pending').length;
  const rejectedCount = registrations.filter(r => r.status === 'rejected').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tournament Details</h1>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setIsEditDialogOpen(true)}
            leftIcon={<Edit className="h-5 w-5" />}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            leftIcon={<Trash2 className="h-5 w-5" />}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
              <Trophy className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedTournament.title}</h2>
              <div className="mt-2 flex items-center space-x-6 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{formatDate(selectedTournament.start_date)}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  <span>{approvedCount}/{selectedTournament.max_participants} Participants</span>
                </div>
                <div className="flex items-center">
                  <FaRupeeSign className="h-5 w-5 mr-2" />
                  <span>{selectedTournament.prize_pool} Prize Pool</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-600 font-medium">Approved</span>
                </div>
                <span className="text-2xl font-bold text-green-600">{approvedCount}</span>
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-yellow-600 font-medium">Pending</span>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{pendingCount}</span>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-600 font-medium">Rejected</span>
                </div>
                <span className="text-2xl font-bold text-red-600">{rejectedCount}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Registrations</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {registration.logo_url ? (
                            <img
                              src={registration.logo_url}
                              alt={registration.team_name}
                              className="h-10 w-10 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/40?text=Team';
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <Trophy className="h-5 w-5 text-purple-600" />
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {registration.team_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {registration.contact_info.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {registration.contact_info.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(registration.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          registration.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : registration.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {registration.status === 'pending' && (
                          <div className="flex justify-end space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateRegistrationStatus(registration.id, 'approved')}
                              leftIcon={<CheckCircle className="h-4 w-4" />}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleUpdateRegistrationStatus(registration.id, 'rejected')}
                              leftIcon={<XCircle className="h-4 w-4" />}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Edit Tournament"
      >
        <TournamentForm
          onSubmit={handleUpdate}
          initialData={selectedTournament}
        />
      </Dialog>
    </div>
  );
};

export default TournamentDetails;