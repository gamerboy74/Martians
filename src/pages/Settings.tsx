import React, { useState, useEffect } from "react";
import {
  Bell,
  Globe,
  Shield,
  Moon,
  Sun,
  Palette,
  Server,
  User,
  Save,
  Edit2,
  Power,
  Upload,
  Users,
} from "lucide-react";
import { UserRoleManagement } from "../components/ui/UserRoleManagement";
import { useAuthStore } from "../stores/authStore";
import { useSettingsStore } from "../stores/settingsStore";
import { Button } from "../components/ui/Button";
import { useToast } from "../hooks/useToast";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const Settings: React.FC = () => {
  const { session, isAdmin } = useAuthStore();
  const {
    theme,
    language,
    notifications,
    isEditing,
    loading,
    maintenanceMode,
    setTheme,
    setLanguage,
    setNotifications,
    setIsEditing,
    setMaintenanceMode,
    updateProfile,
    updateUserRole,
  } = useSettingsStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedRole, setEditedRole] = useState<"admin" | "user">("user");

  useEffect(() => {
    fetchProfile();
  }, [session]);

  const fetchProfile = async () => {
    try {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditedName(data?.full_name || "");
      setEditedEmail(session.user.email || "");

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      setEditedRole(roleData?.role || "user");
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      toast.success("Profile picture updated successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload profile picture");
    }
  };

  const handleMaintenanceToggle = async (value: boolean) => {
    const success = await setMaintenanceMode(value);
    if (success) {
      toast.success(`Maintenance mode ${value ? "enabled" : "disabled"}`);
    } else {
      toast.error("Failed to update maintenance mode");
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        email: editedEmail,
        data: {
          full_name: editedName,
        },
      });

      if (isAdmin) {
        await updateUserRole(session!.user!.id, editedRole);
      }

      toast.success("Settings updated successfully");
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 text-gray-900 p-3 sm:p-4 md:p-6 ${theme === "dark" ? "dark bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white" : ""}`}>
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4`}>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 animate-fade-in">
            Settings
          </h1>
          <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 bg-red-600 text-white rounded-full shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  isLoading={loading}
                  leftIcon={<Save className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />}
                  className="group w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                leftIcon={<Edit2 className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 group-hover:scale-110" />}
                className="group w-full sm:w-auto px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300"
              >
                Edit Settings
              </Button>
            )}
          </div>
        </div>

        {/* Main Settings Container */}
        <div className={`bg-white/95 dark:bg-gray-800/95 shadow-lg rounded-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50`}>
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {/* Profile Section */}
              <div>
                <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                    <span>Profile</span>
                  </div>
                </h2>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
                      {session?.user?.user_metadata?.avatar_url ? (
                        <img
                          src={session.user.user_metadata.avatar_url}
                          alt="Profile"
                          className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover shadow-md hover:brightness-110 transition-all duration-300"
                        />
                      ) : (
                        <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-md animate-pulse-slow">
                          <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white transition-transform duration-300 hover:scale-110" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          Profile Picture
                        </h3>
                        <label className="mt-2 cursor-pointer inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:from-purple-700 hover:to-indigo-700 hover:shadow-lg transition-all duration-300">
                          <Upload className="h-4 w-4 transition-transform duration-300 hover:scale-110" />
                          <span className="text-xs sm:text-sm">Upload New Picture</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                        Full Name
                      </h3>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-white/90 dark:bg-gray-600 border border-gray-200 dark:border-gray-700 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 dark:text-white text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
                        />
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          {profile?.full_name || "Not set"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                        Email
                      </h3>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedEmail}
                          onChange={(e) => setEditedEmail(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-white/90 dark:bg-gray-600 border border-gray-200 dark:border-gray-700 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 dark:text-white text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
                        />
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          {session?.user?.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                        Role
                      </h3>
                      {isEditing && isAdmin ? (
                        <select
                          value={editedRole}
                          onChange={(e) =>
                            setEditedRole(e.target.value as "admin" | "user")
                          }
                          className="mt-1 block w-full px-3 py-2 sm:py-3 rounded-xl bg-white/90 dark:bg-gray-600 border border-gray-200 dark:border-gray-700 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 dark:text-white text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
                        >
                          <option value="user">User</option>
                          <option value="admin">Administrator</option>
                        </select>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          {isAdmin ? "Administrator" : "User"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* System Settings */}
              <div>
                <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                    <span>System</span>
                  </div>
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Power className="h-5 w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                      <div>
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          Maintenance Mode
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          Enable maintenance mode for the website
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={async (e) => handleMaintenanceToggle(e.target.checked)}
                        disabled={loading}
                        className="sr-only peer"
                      />
                      <div className={`w-11 sm:w-14 h-6 sm:h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}>
                        {loading && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Appearance Settings */}
              <div>
                <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-4">
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                    <span>Appearance</span>
                  </div>
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 sm:gap-4">
                      {theme === "light" ? (
                        <Sun className="h-5 w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                      ) : (
                        <Moon className="h-5 w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                      )}
                      <div>
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          Theme
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          Choose your preferred theme
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <button
                        onClick={() => setTheme("light")}
                        className={`relative px-3 sm:px-4 py-1 sm:py-2 rounded-full transition-all duration-300 ${
                          theme === "light"
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                            : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 hover:shadow-md"
                        }`}
                      >
                        <Sun className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 hover:scale-110" />
                        <span className="sr-only">Light Mode</span>
                      </button>
                      <button
                        onClick={() => setTheme("dark")}
                        className={`relative px-3 sm:px-4 py-1 sm:py-2 rounded-full transition-all duration-300 ${
                          theme === "dark"
                            ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                            : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 hover:shadow-md"
                        }`}
                      >
                        <Moon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 hover:scale-110" />
                        <span className="sr-only">Dark Mode</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Globe className="h-5 w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                      <div>
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white">
                          Language
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          Select your preferred language
                        </p>
                      </div>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="px-3 py-2 sm:py-3 rounded-xl bg-white/90 dark:bg-gray-600 border border-gray-200 dark:border-gray-700 shadow-md focus:border-purple-600 focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 text-gray-900 dark:text-white text-xs sm:text-sm transition-all duration-300 hover:shadow-lg"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                    <span>Notifications</span>
                  </div>
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="space-y-3 sm:space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()} Notifications
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() =>
                              setNotifications(
                                key as keyof typeof notifications,
                                !value
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 sm:w-14 h-6 sm:h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 sm:after:h-6 sm:after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Admin Settings */}
              {isAdmin && (
                <div>
                  <h2 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white mb-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-purple-600 transition-transform duration-300 hover:scale-110" />
                      <span>Admin Settings</span>
                    </div>
                  </h2>
                  <UserRoleManagement />
                </div>
              )}
            </div>
          </div>
        </div>
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

        /* Responsive Adjustments for Small Devices */
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
          .text-xl {
            font-size: 1.125rem;
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
          .gap-6 {
            gap: 1rem;
          }
          .w-16 {
            width: 2.5rem;
            height: 2.5rem;
          }
          .h-12 {
            height: 2rem;
            width: 2rem;
          }
          .py-3 {
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }
          .px-4 {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          .gap-4 {
            gap: 0.75rem;
          }
          .w-14 {
            width: 2.75rem;
          }
          .h-7 {
            height: 1.5rem;
          }
          .w-11 {
            width: 2.25rem;
          }
          .h-6 {
            height: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;