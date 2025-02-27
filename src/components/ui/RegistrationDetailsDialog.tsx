import React, { useEffect, useState, useCallback, useRef } from "react";
import { Dialog } from "./Dialog";
import { formatDate } from "../../lib/utils";
import { Trophy, Users, Monitor, MapPin } from "lucide-react";
import { supabase } from "../../lib/supabase"; // Assuming this is the same Dialog component

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

// Memoized sub-components
const TeamInfo: React.FC<{ registration: Registration }> = React.memo(({ registration }) => (
  <div className="bg-white/90 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200/50">
    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
      <img
        src={registration.logo_url || "https://via.placeholder.com/128?text=No+Logo"}
        alt={`${registration.team_name} Logo`}
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover border border-gray-200 shadow-sm hover:brightness-110 transition-all duration-300"
        onError={(e) => {
          (e.target as HTMLImageElement).src = "https://via.placeholder.com/128?text=No+Logo";
        }}
      />
      <div className="text-center sm:text-left">
        <h4 className="text-base sm:text-lg font-medium text-gray-900 truncate">{registration.team_name}</h4>
        <p className="text-xs sm:text-sm text-gray-600 truncate">{registration.tournaments?.title}</p>
      </div>
    </div>
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
      <div>
        <dt className="text-xs sm:text-sm font-medium text-gray-500">Tournament</dt>
        <dd className="text-xs sm:text-sm text-gray-900 truncate">{registration.tournaments?.title}</dd>
      </div>
      <div>
        <dt className="text-xs sm:text-sm font-medium text-gray-500">Registration Date</dt>
        <dd className="text-xs sm:text-sm text-gray-900">{formatDate(registration.created_at)}</dd>
      </div>
    </dl>
  </div>
));

const TeamMembers: React.FC<{ teamMembers: { name: string; username: string }[] }> = React.memo(
  ({ teamMembers }) => (
    <div className="bg-white/90 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200/50">
      <h3 className="text-md sm:text-lg font-medium text-gray-700 mb-3 animate-slide-in">Team Members</h3>
      <ul className="space-y-2 sm:space-y-3">
        {teamMembers.map((member, index) => (
          <li
            key={index}
            className="flex items-center justify-between p-2 sm:p-3 bg-white/95 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-300"
          >
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{member.name}</p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{member.username}</p>
            </div>
            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full shadow-sm">
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
    <div className="bg-white/90 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200/50">
      <h3 className="text-md sm:text-lg font-medium text-gray-700 mb-3 animate-slide-in">Contact Information</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        {[
          ["Full Name", contactInfo.full_name],
          ["Email", contactInfo.email],
          ["Phone", contactInfo.phone],
          ["In-game Name", contactInfo.in_game_name],
          ["Date of Birth", formatDate(contactInfo.date_of_birth)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs sm:text-sm font-medium text-gray-500">{label}</dt>
            <dd className="text-xs sm:text-sm text-gray-900 truncate">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
);

const GameDetails: React.FC<{ gameDetails: Registration["game_details"] }> = React.memo(
  ({ gameDetails }) => (
    <div className="bg-white/90 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200/50">
      <h3 className="text-md sm:text-lg font-medium text-gray-700 mb-3 animate-slide-in">Game Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        {[
          { icon: Monitor, label: "Platform", value: gameDetails.platform },
          { icon: Trophy, label: "UID", value: gameDetails.uid },
          { icon: Users, label: "Device Model", value: gameDetails.device_model },
          { icon: MapPin, label: "Region", value: gameDetails.region },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2 bg-white/95 p-2 sm:p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-300">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
            <div>
              <dt className="text-xs sm:text-sm font-medium text-gray-900">{label}</dt>
              <dd className="text-xs sm:text-sm text-gray-600 truncate">{value}</dd>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
);

const TournamentPrefs: React.FC<{ prefs: Registration["tournament_preferences"] }> = React.memo(
  ({ prefs }) => (
    <div className="bg-white/90 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200/50">
      <h3 className="text-md sm:text-lg font-medium text-gray-700 mb-3 animate-slide-in">Tournament Preferences</h3>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        {[
          ["Format", prefs.format],
          ["Mode", prefs.mode],
          ["Experience", prefs.experience ? "Yes" : "No"],
          ...(prefs.previous_tournaments
            ? [["Previous Tournaments", prefs.previous_tournaments]]
            : []),
        ].map(([label, value]) => (
          <div key={label} className={label === "Previous Tournaments" ? "col-span-1 sm:col-span-2" : ""}>
            <dt className="text-xs sm:text-sm font-medium text-gray-500">{label}</dt>
            <dd
              className={`text-xs sm:text-sm text-gray-900 ${
                label === "Previous Tournaments" ? "mt-1 bg-white/95 p-2 sm:p-3 rounded-lg shadow-sm" : ""
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
    const [isZoomOpen, setIsZoomOpen] = useState(false);
    const screenshotRef = useRef<HTMLDivElement>(null);

    const fetchScreenshotUrl = useCallback(async (screenshotPath?: string) => {
      if (!screenshotPath) {
        console.log("No screenshot path provided");
        setScreenshotUrl(undefined);
        setIsImageError(false);
        return;
      }

      setIsLoading(true);

      try {
        const { data } = supabase.storage.from("payment-screenshots").getPublicUrl(screenshotPath);

        if (data?.publicUrl) {
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
        setIsImageError(false);
        fetchScreenshotUrl(path);
      } else {
        setScreenshotUrl(undefined);
        setIsImageError(false);
      }
    }, [path, fetchScreenshotUrl]);

    const handleImageClick = () => {
      if (!isImageError && screenshotUrl) {
        setIsZoomOpen(true);
      }
    };

    if (!txId && !path) return null;

    

    return (
      <div className="bg-white/90 rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200/50 relative">
        <h3 className="text-md sm:text-lg font-medium text-gray-700 mb-3 animate-slide-in">Payment Information</h3>
        <dl className="space-y-3 sm:space-y-4">
          {txId && (
            <div className="flex items-center gap-2 bg-white/95 p-2 sm:p-3 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-300">
              <dt className="text-xs sm:text-sm font-medium text-gray-500">Transaction ID</dt>
              <dd className="text-xs sm:text-sm text-gray-900 truncate">{txId}</dd>
            </div>
          )}
          {path && (
            <div>
              <dt className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Payment Screenshot</dt>
              <dd className="mt-2 relative" ref={screenshotRef}>
                {isLoading ? (
                  <div className="w-full max-w-xs bg-gray-100 rounded-lg border border-gray-200 p-4 flex items-center justify-center h-20 sm:h-24">
                    <p className="text-gray-500 text-xs sm:text-sm">Loading screenshot...</p>
                  </div>
                ) : isImageError ? (
                  <div className="w-full max-w-xs bg-gray-100 rounded-lg border border-gray-200 p-4 text-center">
                    <p className="text-gray-500 text-xs sm:text-sm">Screenshot not available</p>
                    <p className="text-xs text-gray-400 mt-1">Path: {path}</p>
                  </div>
                ) : screenshotUrl ? (
                  <div className="w-full max-w-xs cursor-pointer" onClick={handleImageClick}>
                    <img
                      src={screenshotUrl}
                      alt="Payment screenshot"
                      className="w-full h-auto rounded-lg border border-gray-200 shadow-sm object-contain max-h-40 sm:max-h-48 hover:scale-105 transition-all duration-300"
                      onError={(e) => {
                        console.error("Screenshot failed to load:", path);
                        setIsImageError(true);
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-xs bg-gray-100 rounded-lg border border-gray-200 p-4 flex items-center justify-center h-20 sm:h-24">
                    <p className="text-gray-500 text-xs sm:text-sm">No screenshot available</p>
                  </div>
                )}
                {/* Zoomed Screenshot Dialog */}
                {isZoomOpen && screenshotUrl && !isImageError && (
                  <div
                    className="absolute bottom-full left-0 mb-2 w-full max-w-lg sm:max-w-3xl bg-white/95 rounded-lg shadow-2xl border border-gray-200/50 p-3 sm:p-4 z-50 animate-fade-in"
                    style={{ transform: 'translateY(-10px)' }}
                  >
                    <img
                      src={screenshotUrl}
                      alt="Zoomed Payment Screenshot"
                      className="w-full h-auto max-h-80 sm:max-h-[90vh] rounded-lg border border-gray-200 shadow-lg object-contain"
                      onError={(e) => {
                        console.error("Zoomed screenshot failed to load:", path);
                        setIsImageError(true);
                      }}
                    />
                    <button
                      onClick={() => setIsZoomOpen(false)}
                      className="absolute top-2 right-2 bg-gray-600/70 text-white rounded-full p-1.5 sm:p-2 hover:bg-gray-700 transition-all duration-300"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
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
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Registration Details"
      className="bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl shadow-2xl max-w-md sm:max-w-2xl mx-auto p-4 sm:p-6 border border-gray-200/50 transform transition-all duration-300 ease-in-out scale-95 hover:scale-100"
    >
      <div className="space-y-4 sm:space-y-6">
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
          .space-y-4 > * + * {
            margin-top: 0.75rem;
          }
          .p-6 {
            padding: 1rem;
          }
          .p-4 {
            padding: 0.75rem;
          }
          .p-3 {
            padding: 0.5rem;
          }
          .p-2 {
            padding: 0.375rem;
          }
          .text-lg {
            font-size: 1rem;
          }
          .text-md {
            font-size: 0.875rem;
          }
          .text-sm {
            font-size: 0.75rem;
          }
          .text-xs {
            font-size: 0.65rem;
          }
          .w-24 {
            width: 4rem;
            height: 4rem;
          }
          .w-20 {
            width: 3.5rem;
            height: 3.5rem;
          }
          .max-h-48 {
            max-height: 10rem;
          }
          .max-h-40 {
            max-height: 8rem;
          }
          .gap-4 {
            gap: 0.75rem;
          }
          .gap-3 {
            gap: 0.5rem;
          }
          .gap-2 {
            gap: 0.25rem;
          }
          .mb-4 {
            margin-bottom: 0.75rem;
          }
          .mb-3 {
            margin-bottom: 0.5rem;
          }
          .mb-2 {
            margin-bottom: 0.25rem;
          }
          .space-y-3 > * + * {
            margin-top: 0.5rem;
          }
          .space-y-2 > * + * {
            margin-top: 0.25rem;
          }
          .w-5 {
            width: 1rem;
            height: 1rem;
          }
          .w-4 {
            width: 0.875rem;
            height: 0.875rem;
          }
          .max-w-2xl {
            max-width: 100%;
          }
          .max-w-md {
            max-width: 100%;
          }
          .max-w-xs {
            max-width: 90%;
          }
          .h-24 {
            height: 6rem;
          }
          .h-20 {
            height: 5rem;
          }
          /* Zoomed Screenshot Specific */
          .max-w-lg {
            max-width: 85%;
          }
          .max-w-3xl {
            max-width: 90%;
          }
          .max-h-80 {
            max-height: 16rem;
          }
          .max-h-\\5b90vh\\5d {
            max-height: 70vh;
          }
          .bottom-full {
            bottom: calc(100% + 0.5rem); /* Ensure spacing above */
          }
        }
      `}</style>
    </Dialog>
  );
});