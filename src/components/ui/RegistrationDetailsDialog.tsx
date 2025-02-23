import React from 'react';
import { Dialog } from './Dialog';
import { formatDate } from '../../lib/utils';
import { Trophy, Users, Monitor, MapPin } from 'lucide-react';

interface RegistrationDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  registration: any;
}

export function RegistrationDetailsDialog({
  isOpen,
  onClose,
  registration
}: RegistrationDetailsProps) {
  if (!registration) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Registration Details"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Team Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-4 mb-4">
              {registration.logo_url ? (
                <img 
                  src={registration.logo_url} 
                  alt={`${registration.team_name} Logo`}
                  className="w-32 h-32 rounded-lg object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/128?text=No+Logo';
                  }}
                />
              ) : (
                <div className="w-32 h-32 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-purple-600" />
                </div>
              )}
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
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Team Members</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <ul className="space-y-3">
              {registration.team_members.map((member: any, index: number) => (
                <li key={index} className="flex items-center justify-between p-2 bg-white rounded-lg shadow-sm">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.username}</p>
                  </div>
                  <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                    {index === 0 ? 'Captain' : `Member ${index + 1}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="text-sm text-gray-900">{registration.contact_info.full_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{registration.contact_info.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900">{registration.contact_info.phone}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">In-game Name</dt>
                <dd className="text-sm text-gray-900">{registration.contact_info.in_game_name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                <dd className="text-sm text-gray-900">{formatDate(registration.contact_info.date_of_birth)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Game Details</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                <Monitor className="w-5 h-5 text-purple-600" />
                <div>
                  <dt className="text-sm font-medium text-gray-900">Platform</dt>
                  <dd className="text-sm text-gray-600">{registration.game_details.platform}</dd>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                <Trophy className="w-5 h-5 text-purple-600" />
                <div>
                  <dt className="text-sm font-medium text-gray-900">UID</dt>
                  <dd className="text-sm text-gray-600">{registration.game_details.uid}</dd>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <dt className="text-sm font-medium text-gray-900">Device Model</dt>
                  <dd className="text-sm text-gray-600">{registration.game_details.device_model}</dd>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
                <MapPin className="w-5 h-5 text-purple-600" />
                <div>
                  <dt className="text-sm font-medium text-gray-900">Region</dt>
                  <dd className="text-sm text-gray-600">{registration.game_details.region}</dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tournament Preferences</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Format</dt>
                <dd className="text-sm text-gray-900">{registration.tournament_preferences.format}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Mode</dt>
                <dd className="text-sm text-gray-900">{registration.tournament_preferences.mode}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Experience</dt>
                <dd className="text-sm text-gray-900">
                  {registration.tournament_preferences.experience ? 'Yes' : 'No'}
                </dd>
              </div>
              {registration.tournament_preferences.previous_tournaments && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Previous Tournaments</dt>
                  <dd className="text-sm text-gray-900 mt-1 bg-white p-3 rounded-lg shadow-sm">
                    {registration.tournament_preferences.previous_tournaments}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </Dialog>
  );
}