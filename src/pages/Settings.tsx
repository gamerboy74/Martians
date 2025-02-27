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

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      toast.success("Profile picture updated successfully");
      window.location.reload(); // Refresh to show new avatar
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
    <div className={`space-y-6 ${theme === "dark" ? "dark" : ""}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setIsEditing(false)}
                disabled={loading}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                isLoading={loading}
                leftIcon={<Save className="h-5 w-5" />}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit2 className="h-5 w-5" />}
            >
              Edit Settings
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Profile Section */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  <span>Profile</span>
                </div>
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    {session?.user?.user_metadata?.avatar_url ? (
                      <img
                        src={session.user.user_metadata.avatar_url}
                        alt="Profile"
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                        <Users className="h-8 w-8 text-purple-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Profile Picture
                      </h3>
                      <label className="mt-2 cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">Upload New Picture</span>
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

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Full Name
                    </h3>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-600 dark:text-white sm:text-sm text-gray-900"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {profile?.full_name || "Not set"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Email
                    </h3>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedEmail}
                        onChange={(e) => setEditedEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-600 dark:text-white sm:text-sm text-gray-900"
                      />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {session?.user?.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      Role
                    </h3>
                    {isEditing && isAdmin ? (
                      <select
                        value={editedRole}
                        onChange={(e) =>
                          setEditedRole(e.target.value as "admin" | "user")
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-purple-500 focus:ring-purple-500 dark:bg-gray-600 dark:text-white sm:text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Administrator</option>
                      </select>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {isAdmin ? "Administrator" : "User"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* System Settings */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-purple-600" />
                  <span>System</span>
                </div>
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Power className="h-5 w-5 text-purple-600" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Maintenance Mode
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Enable maintenance mode for the website
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintenanceMode}
                      onChange={async (e) => {
                        const success = await setMaintenanceMode(
                          e.target.checked
                        );
                        if (success) {
                          toast.success(
                            `Maintenance mode ${e.target.checked ? "enabled" : "disabled"}`
                          );
                        } else {
                          toast.error("Failed to update maintenance mode");
                        }
                      }}
                      disabled={loading}
                      className="sr-only peer"
                    />
                    <div
                      className={`w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
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
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-purple-600" />
                  <span>Appearance</span>
                </div>
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {theme === "light" ? (
                      <Sun className="h-5 w-5 text-purple-600" />
                    ) : (
                      <Moon className="h-5 w-5 text-purple-600" />
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Theme
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Choose your preferred theme
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme("light")}
                      className={`relative px-4 py-2 rounded-lg transition-all duration-300 ${
                        theme === "light"
                          ? "bg-purple-600 text-white shadow-lg"
                          : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                      }`}
                    >
                      <Sun className="h-5 w-5" />
                      <span className="sr-only">Light Mode</span>
                    </button>
                    <button
                      onClick={() => setTheme("dark")}
                      className={`relative px-4 py-2 rounded-lg transition-all duration-300 ${
                        theme === "dark"
                          ? "bg-purple-600 text-white shadow-lg"
                          : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                      }`}
                    >
                      <Moon className="h-5 w-5" />
                      <span className="sr-only">Dark Mode</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Globe className="h-5 w-5 text-purple-600" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                        Language
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Select your preferred language
                      </p>
                    </div>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border text-gray-900 border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent p-2 dark:bg-gray-600 dark:text-white"
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
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-purple-600" />
                  <span>Notifications</span>
                </div>
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
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
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Admin Settings */}
            {isAdmin && (
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
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
  );
};

export default Settings;
