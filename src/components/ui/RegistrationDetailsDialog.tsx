import React, { useEffect, useState, useCallback } from "react";
import { Dialog } from "./Dialog";
import { formatDate } from "../../lib/utils";
import { Trophy, Users, Monitor, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabase";

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
  tx_id?: string;
  payment_screenshot_path?: string;
}

interface RegistrationDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
}

// Memoized sub-components for better performance
const TeamInfo: React.FC<{ registration: Registration }> = React.memo(({ registration }) => (
  <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
    <div className="flex items-center gap-4 mb-4">
      <img
        src={registration.logo_url || "https://via.placeholder.com/128?text=No+Logo"}
        alt={`${registration.team_name} Logo`}
        className="w-32 h-32 rounded-lg object-cover border border-gray-200"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://via.placeholder.com/128?text=No+Logo";
        }}
      />
      <div>
        <h4 className="text-xl font-medium text-gray-900">{registration.team_name}</h4>
        <p className="text-sm text-gray-500">{registration.tournaments?.title}</p>
      </div>
    </div>
    <dl className="grid grid-cols-2 gap-4">
      <div>
        <dt className="text-sm font-medium text-gray-500">Tournament</dt>
        <dd className="text-sm text-gray-900">{registration.tournaments?.title}</dd>
      </div>
      <div>
        <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
        <dd className="text-sm text-gray-900">{formatDate(registration.created_at)}</dd>
      </div>
    </dl>
  </div>
));

const TeamMembers: React.FC<{ teamMembers: { name: string; username: string }[] }> = React.memo(
  ({ teamMembers }) => (
    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
      <h3 className="text-md font-medium text-gray-700 mb-3">Team Members</h3>
      <ul className="space-y-3">
        {teamMembers.map((member, index) => (
          <li
            key={index}
            className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{member.name}</p>
              <p className="text-sm text-gray-500">{member.username}</p>
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              {index === 0 ? "Captain" : `Member ${index + 1}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
);

const ContactInfo: React.FC<{ contactInfo: Registration["contact_info"] }> = React.memo(
  ({ contactInfo }) => (
    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
      <h3 className="text-md font-medium text-gray-700 mb-3">Contact Information</h3>
      <dl className="grid grid-cols-2 gap-4">
        {[
          ["Full Name", contactInfo.full_name],
          ["Email", contactInfo.email],
          ["Phone", contactInfo.phone],
          ["In-game Name", contactInfo.in_game_name],
          ["Date of Birth", formatDate(contactInfo.date_of_birth)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="text-sm text-gray-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
);

const GameDetails: React.FC<{ gameDetails: Registration["game_details"] }> = React.memo(
  ({ gameDetails }) => (
    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
      <h3 className="text-md font-medium text-gray-700 mb-3">Game Details</h3>
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Monitor, label: "Platform", value: gameDetails.platform },
          { icon: Trophy, label: "UID", value: gameDetails.uid },
          { icon: Users, label: "Device Model", value: gameDetails.device_model },
          { icon: MapPin, label: "Region", value: gameDetails.region },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
            <Icon className="w-5 h-5 text-purple-600" />
            <div>
              <dt className="text-sm font-medium text-gray-900">{label}</dt>
              <dd className="text-sm text-gray-600">{value}</dd>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
);

const TournamentPrefs: React.FC<{ prefs: Registration["tournament_preferences"] }> = React.memo(
  ({ prefs }) => (
    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
      <h3 className="text-md font-medium text-gray-700 mb-3">Tournament Preferences</h3>
      <dl className="grid grid-cols-2 gap-4">
        {[
          ["Format", prefs.format],
          ["Mode", prefs.mode],
          ["Experience", prefs.experience ? "Yes" : "No"],
          ...(prefs.previous_tournaments
            ? [["Previous Tournaments", prefs.previous_tournaments]]
            : []),
        ].map(([label, value]) => (
          <div key={label} className={label === "Previous Tournaments" ? "col-span-2" : ""}>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd
              className={`text-sm text-gray-900 ${
                label === "Previous Tournaments" ? "mt-1 bg-white p-3 rounded-lg shadow-sm" : ""
              }`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
);

const PaymentDetails: React.FC<{ txId?: string; path?: string; tournamentId?: string }> = React.memo(
  ({ txId, path, tournamentId }) => {
    const [screenshotUrl, setScreenshotUrl] = useState<string | undefined>(undefined);
    const [isImageError, setIsImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const fetchScreenshotUrl = useCallback(async (screenshotPath?: string, tournamentId?: string) => {
      if (!screenshotPath) {
        console.log("No screenshot path provided");
        setScreenshotUrl(undefined);
        setIsImageError(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Use the exact path stored in payment_screenshot_path
        console.log("Fetching screenshot URL for path:", screenshotPath);
        
        const { data } = supabase.storage.from("payment-screenshots").getPublicUrl(screenshotPath);
        
        if (data?.publicUrl) {
          console.log("Public URL generated:", data.publicUrl);
          setScreenshotUrl(data.publicUrl);
        } else {
          console.error("No public URL returned for path:", screenshotPath);
          setIsImageError(true);
        }
      } catch (error) {
        console.error("Failed to fetch screenshot URL:", error);
        setIsImageError(true);
      } finally {
        setIsLoading(false);
      }
    }, []);

    useEffect(() => {
      if (path) {
        setIsImageError(false); // Reset error state when path changes
        fetchScreenshotUrl(path, tournamentId);
      } else {
        setScreenshotUrl(undefined);
        setIsImageError(false);
      }
    }, [path, tournamentId, fetchScreenshotUrl]);

    if (!txId && !path) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
        <h3 className="text-md font-medium text-gray-700 mb-3">Payment Information</h3>
        <dl className="space-y-4">
          {txId && (
            <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
              <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
              <dd className="text-sm text-gray-900">{txId}</dd>
            </div>
          )}
          
          {path && (
            <div>
              <dt className="text-sm font-medium text-gray-500 mb-2">Payment Screenshot</dt>
              <dd className="mt-2">
                {isLoading ? (
                  <div className="w-full max-w-md bg-gray-100 rounded-lg border border-gray-200 p-4 flex items-center justify-center h-32">
                    <p className="text-gray-500">Loading screenshot...</p>
                  </div>
                ) : isImageError ? (
                  <div className="w-full max-w-md bg-gray-100 rounded-lg border border-gray-200 p-4 text-center">
                    <p className="text-gray-500">Screenshot not available</p>
                    <p className="text-xs text-gray-400 mt-1">Path: {path}</p>
                    <p className="text-xs text-gray-400">Tournament ID: {tournamentId}</p>
                  </div>
                ) : screenshotUrl ? (
                  <div className="w-full max-w-md">
                    <img
                      src={screenshotUrl}
                      alt="Payment screenshot"
                      className="w-full h-auto rounded-lg border border-gray-200 shadow-sm object-contain max-h-72"
                      onError={(e) => {
                        console.error("Screenshot failed to load:", path);
                        setIsImageError(true);
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-md bg-gray-100 rounded-lg border border-gray-200 p-4 flex items-center justify-center h-32">
                    <p className="text-gray-500">No screenshot available</p>
                  </div>
                )}
              </dd>
            </div>
          )}
        </dl>
      </div>
    );
  }
);

export const RegistrationDetailsDialog = React.memo(function RegistrationDetailsDialog({
  isOpen,
  onClose,
  registration,
}: RegistrationDetailsProps) {
  if (!registration) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Registration Details" className="max-w-2xl">
      <div className="space-y-6 p-4">
        <TeamInfo registration={registration} />
        <TeamMembers teamMembers={registration.team_members} />
        <ContactInfo contactInfo={registration.contact_info} />
        <GameDetails gameDetails={registration.game_details} />
        <TournamentPrefs prefs={registration.tournament_preferences} />
        <PaymentDetails 
          txId={registration.tx_id} 
          path={registration.payment_screenshot_path} 
          tournamentId={registration.tournament_id}
        />
      </div>
    </Dialog>
  );
});