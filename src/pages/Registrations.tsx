import React, { useEffect, useState } from "react";
import { Users, Check, X, Search, Eye, Calendar, Trophy } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "../hooks/useToast";
import { formatDate } from "../lib/utils";
import { Button } from "../components/ui/Button";
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
  game_details: { platform: string; uid: string; device_model: string; region: string };
  tournament_preferences: { format: string; mode: string; experience: boolean; previous_tournaments?: string };
  tournaments: { title: string };
  logo_url?: string;
  tx_id?: string; // Added for transaction ID
  payment_screenshot_path?: string; // Added for screenshot path
}

const Registrations: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const toast = useToast();

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("registrations")
        .select(`
          *,
          tournaments (
            title
          )
        `)
        .eq("status", "pending")
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
    fetchRegistrations();

    const subscription = supabase
      .channel("registrations_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations" },
        (payload) => {
          console.log("Received payload:", payload);
          if (payload.eventType === "UPDATE") {
            if (payload.new.status !== "pending") {
              setRegistrations((prev) => prev.filter((reg) => reg.id !== payload.new.id));
              toast.success(`Registration ${payload.new.status} successfully`); // Show toast on real-time update
            }
          } else if (payload.eventType === "INSERT" && payload.new.status === "pending") {
            setRegistrations((prev) => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const sendStatusUpdateEmail = async (
    email: string,
    fullName: string,
    teamName: string,
    tournamentId: string,
    status: "approved" | "rejected"
  ) => {
    try {
      const response = await fetch(
        "https://gvmsopxbjhntcublylxu.supabase.co/functions/v1/send-status-update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ email, fullName, teamName, tournamentId, status }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send status update email: ${errorText}`);
      }
      console.log("Status update email sent successfully");
    } catch (error) {
      console.error("Error sending status update email:", error);
      toast.error("Failed to send status update email");
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      setUpdateLoading(id);

      // Fetch registration data
      const { data: registration, error: fetchError } = await supabase
        .from("registrations")
        .select("team_name, contact_info, tournament_id, logo_url")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      const { team_name, contact_info, tournament_id, logo_url } = registration;

      // Handle logo deletion for rejected status
      if (status === "rejected" && logo_url) {
        const logoPath = new URL(logo_url).pathname.split("/").pop();
        if (logoPath) {
          const { error: storageError } = await supabase.storage
            .from("team-logos")
            .remove([logoPath]);
          if (storageError) console.error("Error deleting logo:", storageError);
        }
      }

      // Update registration status
      const { error: updateError } = await supabase
        .from("registrations")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (updateError) throw updateError;

      // Show immediate toast feedback
      toast.success(`Registration ${status} successfully`);

      // Send email asynchronously (don’t wait for it to complete)
      sendStatusUpdateEmail(
        contact_info.email,
        contact_info.full_name,
        team_name,
        tournament_id,
        status
      ).catch((error) => {
        console.error("Error sending email asynchronously:", error);
        toast.error("Failed to send status update email");
      });

      // Update local state immediately
      setRegistrations((prev) => prev.filter((reg) => reg.id !== id));
    } catch (error) {
      console.error("Error updating registration:", error);
      toast.error("Failed to update registration status");
    } finally {
      setUpdateLoading(null);
    }
  };

  const handleViewDetails = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsDetailsOpen(true);
  };

  const filteredRegistrations = registrations.filter(
    (reg) =>
      reg.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.contact_info.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.tournaments?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Pending Registrations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage tournament registration requests
          </p>
        </div>
        <div className="relative w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search registrations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {filteredRegistrations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending registrations</h3>
          <p className="mt-1 text-sm text-gray-500">
            All registration requests have been processed
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRegistrations.map((registration) => (
            <div
              key={registration.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {registration.logo_url ? (
                    <img
                      src={registration.logo_url}
                      alt={`${registration.team_name} logo`}
                      className="h-12 w-12 rounded-lg object-cover"
                      onError={(e) => {
                        console.error(`Failed to load logo: ${registration.logo_url}`);
                        (e.target as HTMLImageElement).src = "/fallback-logo.png";
                      }}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {registration.team_name}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-1" />
                        <span>{registration.tournaments?.title}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(registration.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    onClick={() => handleViewDetails(registration)}
                    leftIcon={<Eye className="h-4 w-4" />}
                    className="w-full sm:w-auto"
                  >
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus(registration.id, "approved")}
                    className="text-green-600 hover:text-green-900 w-full sm:w-auto"
                    leftIcon={<Check className="h-4 w-4" />}
                    isLoading={updateLoading === registration.id}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus(registration.id, "rejected")}
                    className="text-red-600 hover:text-red-900 w-full sm:w-auto"
                    leftIcon={<X className="h-4 w-4" />}
                    isLoading={updateLoading === registration.id}
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
    </div>
  );
};

export default Registrations;