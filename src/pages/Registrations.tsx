import React, { useEffect, useState, useCallback } from "react";
import { Users, Check, X, Search, Eye, Calendar, Trophy } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/useToast";
import { formatDate } from "../lib/utils";
import { Button } from "../components/ui/Button";
import { Dialog } from "../components/ui/Dialog";
import { RegistrationDetailsDialog } from "../components/ui/RegistrationDetailsDialog";

interface Registration {
  id: string;
  tournament_id: string;
  team_name: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  team_members: { name: string; username: string }[];
  contact_info: {
    full_name: string;
    email: string;
    phone: string;
    in_game_name: string;
    date_of_birth: string;
  };
  game_details: {
    platform: string;
    uid: string;
    device_model: string;
    region: string;
  };
  tournament_preferences: {
    format: string;
    mode: string;
    experience: boolean;
    previous_tournaments?: string;
  };
  tournaments: { title: string };
  logo_url?: string;
  tx_id?: string;
  payment_screenshot_path?: string;
}

const Registrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [actionType, setActionType] = useState<"approved" | "rejected" | null>(
    null
  );
  const [registrationToUpdate, setRegistrationToUpdate] = useState<
    string | null
  >(null);
  const { success: toastSuccess, error: toastError } = useToast();

  const fetchRegistrations = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10-second timeout

    try {
      console.log("Fetching registrations...");
      setLoading(true);
      const { data, error } = await supabase
        .from("registrations")
        .select(
          `
          *,
          tournaments (
            title
          )
        `
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .abortSignal(controller.signal);

      if (error) {
        if (error.message === "The operation was aborted") {
          console.warn("Fetch request timed out");
          toastError("Fetch request timed out - please try refreshing");
        } else {
          console.error("Supabase error:", error);
          throw error;
        }
      }

      console.log("Fetched data:", data);
      const registrationsData = (data as Registration[]) || [];
      setRegistrations(registrationsData);

      if (registrationsData.length === 0) {
        console.log("No pending registrations found");
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toastError("Failed to fetch registrations");
      setRegistrations([]);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
      console.log("Loading complete, current registrations:", registrations);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();

    const subscription = supabase
      .channel("registrations_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations" },
        (payload) => {
          console.log("Received real-time payload:", payload);
          if (payload.eventType === "UPDATE") {
            if (payload.new.status !== "pending") {
              setRegistrations((prev) => {
                const newRegistrations = prev.filter(
                  (reg) => reg.id !== payload.new.id
                );
                console.log(
                  "Updated registrations after update:",
                  newRegistrations
                );
                return newRegistrations;
              });
              toastSuccess(`Registration ${payload.new.status} successfully`);
            }
          } else if (
            payload.eventType === "INSERT" &&
            payload.new.status === "pending"
          ) {
            setRegistrations((prev) => {
              const newRegistrations = [payload.new as Registration, ...prev];
              console.log(
                "Updated registrations after insert:",
                newRegistrations
              );
              return newRegistrations;
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchRegistrations]);

  const sendStatusUpdateEmail = async (
    email: string,
    fullName: string,
    teamName: string,
    tournamentId: string,
    status: "approved" | "rejected"
  ) => {
    // Fire-and-forget email sending
    fetch(
      "https://gvmsopxbjhntcublylxu.supabase.co/functions/v1/send-status-update",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email,
          fullName,
          teamName,
          tournamentId,
          status,
        }),
      }
    ).catch((error) => {
      console.error("Error sending status update email:", error);
      toastError("Failed to send status update email"); // This won't block the UI
    });
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      setUpdateLoading(id);
      const { data: registration, error: fetchError } = await supabase
        .from("registrations")
        .select("team_name, contact_info, tournament_id, logo_url")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { team_name, contact_info, tournament_id, logo_url } = registration;

      if (status === "rejected" && logo_url) {
        const logoPath = new URL(logo_url).pathname.split("/").pop();
        if (logoPath) {
          const { error: storageError } = await supabase.storage
            .from("team-logos")
            .remove([logoPath]);
          if (storageError) console.error("Error deleting logo:", storageError);
        }
      }

      const { error: updateError } = await supabase
        .from("registrations")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (updateError) throw updateError;

      toastSuccess(`Registration ${status} successfully`);
      // Send email in the background without awaiting
      sendStatusUpdateEmail(
        contact_info.email,
        contact_info.full_name,
        team_name,
        tournament_id,
        status
      );
      setRegistrations((prev) => prev.filter((reg) => reg.id !== id));
    } catch (error) {
      console.error("Error updating registration:", error);
      toastError("Failed to update registration status");
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleUpdateStatus = (id: string, status: "approved" | "rejected") => {
    console.log("Opening dialog for:", status, "ID:", id);
    setRegistrationToUpdate(id);
    setActionType(status);
    setIsDialogOpen(true);
  };

  const confirmUpdateStatus = async () => {
    console.log("Confirming update:", actionType, registrationToUpdate);
    if (!registrationToUpdate || !actionType) return;

    setIsDialogOpen(false);
    await updateStatus(registrationToUpdate, actionType);
    setRegistrationToUpdate(null);
    setActionType(null);
  };

  const handleViewDetails = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsDetailsOpen(true);
  };

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.contact_info.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (reg.tournaments?.title &&
        reg.tournaments.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-white via-gray-50 to-gray-100">
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
        <div className="bg-white/90 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-fade-in">
              Pending Registrations
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Review and manage tournament registration requests
            </p>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search registrations..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="w-full sm:w-64 pl-10 pr-4 py-2 sm:py-3 rounded-xl bg-white/95 border border-gray-200 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 placeholder:text-gray-400 transition-all duration-300 hover:shadow-lg"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 transition-transform duration-300 hover:scale-110" />
          </div>
        </div>

        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-12 bg-white/90 rounded-xl shadow-lg border border-gray-200/50">
            <Users className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 animate-pulse" />
            <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900 animate-fade-in">
              No pending registrations
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              All registration requests have been processed or none exist
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {filteredRegistrations.map((registration) => (
              <div
                key={registration.id}
                className="bg-white/95 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200/50 p-4 sm:p-6 transform hover:-translate-y-1"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    {registration.logo_url ? (
                      <img
                        src={registration.logo_url}
                        alt={`${registration.team_name} logo`}
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover shadow-sm hover:brightness-110 transition-all duration-300"
                        onError={(e) => {
                          console.error(
                            `Failed to load logo: ${registration.logo_url}`
                          );
                          (e.target as HTMLImageElement).src =
                            "/fallback-logo.png";
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md animate-pulse-slow">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white transition-transform duration-300 hover:scale-110" />
                      </div>
                    )}
                    <div className="truncate">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                        {registration.team_name}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 mr-1 text-purple-600 transition-transform duration-300 hover:scale-110" />
                          <span className="truncate">
                            {registration.tournaments?.title}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-purple-600 transition-transform duration-300 hover:scale-110" />
                          <span>{formatDate(registration.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      onClick={() => handleViewDetails(registration)}
                      leftIcon={
                        <Eye className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      }
                      className="group w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleUpdateStatus(registration.id, "approved")
                      }
                      className="group w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 text-green-600 rounded-full shadow-md hover:bg-green-100 hover:text-green-900 transition-all duration-300"
                      leftIcon={
                        <Check className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      }
                      isLoading={updateLoading === registration.id}
                      disabled={updateLoading !== null}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleUpdateStatus(registration.id, "rejected")
                      }
                      className="group w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 text-red-600 rounded-full shadow-md hover:bg-red-100 hover:text-red-900 transition-all duration-300"
                      leftIcon={
                        <X className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      }
                      isLoading={updateLoading === registration.id}
                      disabled={updateLoading !== null}
                    >
                      Reject
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
          registration={selectedRegistration}
        />

        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
            <Dialog
              isOpen={isDialogOpen}
              onClose={() => {
                setIsDialogOpen(false);
                setRegistrationToUpdate(null);
                setActionType(null);
              }}
              title={`Confirm ${actionType === "approved" ? "Approval" : "Rejection"}`}
              className="bg-white/90 rounded-lg shadow-lg max-w-md w-full mx-auto p-4 border border-gray-200/50 backdrop-blur-md"
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Are you sure you want to{" "}
                  {actionType === "approved" ? "approve" : "reject"} this
                  registration?
                  {actionType === "rejected" &&
                    " This action cannot be undone."}
                </p>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setRegistrationToUpdate(null);
                      setActionType(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant={actionType === "approved" ? "primary" : "danger"}
                    onClick={confirmUpdateStatus}
                    isLoading={updateLoading !== null}
                    className={`px-4 py-2 text-white rounded-full transition-colors duration-200 ${
                      actionType === "approved"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {actionType === "approved" ? "Approve" : "Reject"}
                  </Button>
                </div>
              </div>
            </Dialog>
          </div>
        )}
      </div>

      <style>{`
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
          .h-6 {
            height: 1.25rem;
            width: 1.25rem;
          }
          .gap-6 {
            gap: 1rem;
          }
          .w-64 {
            width: 100%;
          }
          .py-2 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Registrations;