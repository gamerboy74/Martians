import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface SettingsState {
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    updates: boolean;
  };
  isEditing: boolean;
  loading: boolean;
  maintenanceMode: boolean;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: string) => void;
  setNotifications: (key: keyof SettingsState['notifications'], value: boolean) => void;
  setIsEditing: (value: boolean) => void;
  setMaintenanceMode: (value: boolean) => Promise<boolean>;
  updateProfile: (params: { email?: string; data?: { full_name?: string } }) => Promise<void>;
  updateUserRole: (userId: string, role: 'admin' | 'user') => Promise<void>;
  initSettings: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        updates: true,
      },
      isEditing: false,
      loading: false,
      maintenanceMode: false,

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
      },

      setLanguage: (language) => set({ language }),

      setNotifications: (key, value) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            [key]: value,
          },
        })),

      setIsEditing: (value) => set({ isEditing: value }),

      setMaintenanceMode: async (value: boolean): Promise<boolean> => {
        try {
          set({ loading: true });
          const { error } = await supabase
            .from('site_settings')
            .upsert({ 
              id: 1, // Fixed ID for site-wide settings
              maintenance_mode: value,
              updated_at: new Date().toISOString()
            });

          if (error) throw error;
          set({ maintenanceMode: value });
          return true;
        } catch (error) {
          console.error('Error updating maintenance mode:', error);
          return false;
        } finally {
          set({ loading: false });
        }
      },

      updateProfile: async (params) => {
        try {
          set({ loading: true });
          const { error } = await supabase.auth.updateUser(params);
          if (error) throw error;
        } catch (error) {
          console.error('Error updating profile:', error);
          throw error;
        } finally {
          set({ loading: false, isEditing: false });
        }
      },

      updateUserRole: async (userId, role) => {
        try {
          set({ loading: true });
          const { error } = await supabase
            .from('user_roles')
            .upsert({ user_id: userId, role })
            .eq('user_id', userId);
          
          if (error) throw error;
        } catch (error) {
          console.error('Error updating user role:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      initSettings: async () => {
        try {
          set({ loading: true });
          const { data, error } = await supabase
            .from('site_settings')
            .select('maintenance_mode')
            .eq('id', 1)
            .single();

          if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
          set({ 
            maintenanceMode: data?.maintenance_mode ?? false 
          });
        } catch (error) {
          console.error('Error initializing settings:', error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        notifications: state.notifications,
        // Note: maintenanceMode is no longer persisted locally since it's stored in DB
      }),
    }
  )
);

// Initialize settings and theme on load
if (typeof window !== 'undefined') {
  const { theme, initSettings } = useSettingsStore.getState();
  document.documentElement.classList.toggle('dark', theme === 'dark');
  // Call initSettings immediately
  useSettingsStore.getState().initSettings();
}

// Optional: Add real-time subscription for maintenance mode updates
if (typeof window !== 'undefined') {
  const subscription = supabase
    .channel('site_settings')
    .on(
      'postgres_changes',
      { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'site_settings',
        filter: 'id=eq.1'
      },
      (payload) => {
        useSettingsStore.setState({ 
          maintenanceMode: payload.new.maintenance_mode 
        });
      }
    )
    .subscribe();
}

// Initialize theme on load
if (typeof window !== 'undefined') {
  const theme = useSettingsStore.getState().theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}