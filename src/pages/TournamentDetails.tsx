import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trophy, Calendar, Users, Edit, Trash2, CheckCircle, Clock, XCircle } from "lucide-react";
import { Dialog } from "../components/ui/Dialog";
import { TournamentForm } from "../components/ui/TournamentForm";
import { Button } from "../components/ui/Button";
import { useTournamentStore } from "../stores/tournamentStore";
import { useToast } from "../hooks/useToast";
import { formatDate } from "../lib/utils";
import { supabase } from "../lib/supabase";
import { FaRupeeSign } from "react-icons/fa";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Registration {
  id: string;
  team_name: string;
  status: "pending" | "approved" | "rejected";
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
        .from("registrations")
        .select("*")
        .eq("tournament_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast.error("Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      getTournamentById(id);
      fetchRegistrations();

      const subscription: RealtimeChannel = supabase
        .channel("registration_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "registrations",
            filter: `tournament_id=eq.${id}`,
          },
          () => {
            fetchRegistrations();
          }
        )
        .subscribe();

      return () => subscription.unsubscribe();
    }
  }, [id, getTournamentById]);

  if (!selectedTournament) {
    return (
      <div className="flex justify-center items-center py-12 bg-gradient-to-br from-white via-gray-50 to-gray-100 min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-2 border-purple-700 opacity-60"></div>
          <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 bg-purple-500/20"></div>
        </div>
      </div>
    );
  }

  const handleUpdate = async (data: any) => {
    try {
      await updateTournament(id!, data);
      setIsEditDialogOpen(false);
      toast.success("Tournament updated successfully");
    } catch (error) {
      toast.error("Failed to update tournament");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this tournament?")) {
      try {
        await deleteTournament(id!);
        toast.success("Tournament deleted successfully");
        navigate("/admin/tournaments");
      } catch (error) {
        toast.error("Failed to delete tournament");
      }
    }
  };

  const handleUpdateRegistrationStatus = async (registrationId: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase.from("registrations").update({ status }).eq("id", registrationId);
      if (error) throw error;
      toast.success(`Registration ${status} successfully`);
      fetchRegistrations();
    } catch (error) {
      console.error("Error updating registration:", error);
      toast.error("Failed to update registration status");
    }
  };

  const approvedCount = registrations.filter((r) => r.status === "approved").length;
  const pendingCount = registrations.filter((r) => r.status === "pending").length;
  const rejectedCount = registrations.filter((r) => r.status === "rejected").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/50">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 animate-fade-in mb-4 sm:mb-0">
            {selectedTournament.title}
          </h1>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsEditDialogOpen(true)}
              leftIcon={<Edit className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />}
              className="group px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl transition-all duration-300"
            >
              Edit
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              leftIcon={<Trash2 className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />}
              className="group px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl shadow-md hover:from-red-700 hover:to-pink-700 hover:shadow-xl transition-all duration-300"
            >
              Delete
            </Button>
          </div>
        </div>

        {/* Tournament Info */}
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse-slow">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-white transition-transform duration-300 hover:scale-110" />
              </div>
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">{selectedTournament.title}</h2>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-700">
                  <div className="flex items-center gap-2 bg-gray-100/80 px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-sm">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                    <span className="text-sm sm:text-base">{formatDate(selectedTournament.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100/80 px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-sm">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                    <span className="text-sm sm:text-base">
                      {approvedCount}/{selectedTournament.max_participants} Participants
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100/80 px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-sm">
                    <FaRupeeSign className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                    <span className="text-sm sm:text-base">{selectedTournament.prize_pool} Prize Pool</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-300 hover:scale-110" />
                    <span className="text-white font-medium text-sm sm:text-base">Approved</span>
                  </div>
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{approvedCount}</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-300 hover:scale-110" />
                    <span className="text-white font-medium text-sm sm:text-base">Pending</span>
                  </div>
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{pendingCount}</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-300 hover:scale-110" />
                    <span className="text-white font-medium text-sm sm:text-base">Rejected</span>
                  </div>
                  <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">{rejectedCount}</span>
                </div>
              </div>
            </div>

            {/* Registrations Section */}
            <div className="border-t border-gray-200/50 pt-6 sm:pt-8">
              <h3 className="text-lg sm:text-xl md:text-2xl font-medium text-gray-900 mb-4 sm:mb-6 animate-slide-in">Registrations</h3>
              <div className="overflow-x-auto bg-white/80 rounded-xl shadow-lg border border-gray-200/50">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200 hidden sm:table-header-group">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Team</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Registration Date</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-sm font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {registrations.map((registration) => (
                      <tr key={registration.id} className="hover:bg-gray-100/90 transition-all duration-300">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            {registration.logo_url ? (
                              <img
                                src={registration.logo_url}
                                alt={registration.team_name}
                                className="h-10 w-10 rounded-full object-cover shadow-md hover:brightness-110 transition-all duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://via.placeholder.com/40?text=Team";
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center shadow-md animate-pulse-slow">
                                <Trophy className="h-5 w-5 text-white transition-transform duration-300 hover:scale-110" />
                              </div>
                            )}
                            <div className="truncate max-w-[200px]">
                              <div className="text-base font-medium text-gray-900">{registration.team_name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="truncate max-w-[200px]">
                            <div className="text-base text-gray-900">{registration.contact_info.full_name}</div>
                            <div className="text-sm text-gray-500">{registration.contact_info.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-base text-gray-600">
                          {formatDate(registration.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full shadow-md transition-all duration-300 ${
                              registration.status === "approved"
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : registration.status === "rejected"
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            }`}
                          >
                            {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {registration.status === "pending" && (
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateRegistrationStatus(registration.id, "approved")}
                                leftIcon={<CheckCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
                                className="group px-3 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full shadow-md hover:from-green-600 hover:to-teal-600 hover:shadow-lg transition-all duration-300"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleUpdateRegistrationStatus(registration.id, "rejected")}
                                leftIcon={<XCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />}
                                className="group px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-md hover:from-red-600 hover:to-pink-600 hover:shadow-lg transition-all duration-300"
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

        {/* Edit Dialog */}
        <Dialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          title="Edit Tournament"
          className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-2xl max-w-md mx-auto p-4 sm:p-6 border border-gray-200/50 transform transition-all duration-300 ease-in-out scale-95 hover:scale-100"
        >
          <TournamentForm onSubmit={handleUpdate} initialData={selectedTournament} isLoading={loading} />
        </Dialog>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-slow {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s infinite ease-in-out;
        }

        /* Responsive Adjustments for Small Devices */
        @media (max-width: 640px) {
          .min-h-screen {
            padding: 0.5rem; /* Reduced overall padding for mobile */
          }
          .max-w-7xl {
            margin-left: 0.25rem;
            margin-right: 0.25rem;
          }
          .space-y-6 > * + * {
            margin-top: 1rem;
          }
          .p-6 {
            padding: 1rem;
          }
          .p-4 {
            padding: 0.75rem;
          }
          .text-4xl {
            font-size: 1.75rem;
          }
          .text-3xl {
            font-size: 1.5rem;
          }
          .text-2xl {
            font-size: 1.25rem;
          }
          .text-xl {
            font-size: 1rem;
          }
          .text-lg {
            font-size: 0.875rem;
          }
          .text-base {
            font-size: 0.75rem;
          }
          .text-sm {
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
          .h-10 {
            height: 1.5rem;
            width: 1.5rem;
          }
          .h-8 {
            height: 1.25rem;
            width: 1.25rem;
          }
          .h-6 {
            height: 1rem;
            width: 1rem;
          }
          .h-5 {
            height: 0.875rem;
            width: 0.875rem;
          }
          .h-4 {
            height: 0.75rem;
            width: 0.75rem;
          }
          .gap-6 {
            gap: 1rem;
          }
          .gap-4 {
            gap: 0.75rem;
          }
          .gap-3 {
            gap: 0.5rem;
          }
          .mb-8 {
            margin-bottom: 1.5rem;
          }
          .mb-6 {
            margin-bottom: 1rem;
          }
          .mb-4 {
            margin-bottom: 0.75rem;
          }
          .space-x-4 {
            gap: 0.5rem;
          }
          .px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          .py-2 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .flex-col {
            flex-direction: column;
            align-items: stretch;
          }
          .flex-row {
            flex-wrap: wrap;
          }
          .text-right {
            text-align: left;
          }
          /* Tournament Info */
          .truncate {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .max-w-[200px] {
            max-width: 150px;
          }
          /* Stats */
          .grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.5rem;
          }
          .p-6 {
            padding: 0.75rem;
          }
          .text-4xl {
            font-size: 1.5rem;
          }
          .text-3xl {
            font-size: 1.25rem;
          }
          /* Registrations Table */
          table {
            display: block;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          thead {
            display: none;
          }
          tbody {
            display: block;
          }
          tr {
            display: flex;
            flex-direction: column;
            padding: 0.5rem;
            margin-bottom: 0.5rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            background-color: #fff;
          }
          td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.25rem 0.5rem;
            border: none;
          }
          td:first-child {
            padding-top: 0.5rem;
          }
          td:last-child {
            padding-bottom: 0.5rem;
          }
          .whitespace-nowrap {
            white-space: normal;
          }
          .max-w-[200px] {
            max-width: 120px;
          }
          .space-x-2 {
            gap: 0.25rem;
          }
          .px-3 {
            padding-left: 0.5rem;
            padding-right: 0.5rem;
          }
          .py-1 {
            padding-top: 0.25rem;
            padding-bottom: 0.25rem;
          }
          /* Dialog */
          .max-w-md {
            max-width: 100%;
            margin: 0.5rem;
          }
          .p-4 {
            padding: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TournamentDetails;