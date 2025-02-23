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
  setMaintenanceMode: (value: boolean) => void;
  updateProfile: (params: { email?: string; data?: { full_name?: string } }) => Promise<void>;
  updateUserRole: (userId: string, role: 'admin' | 'user') => Promise<void>;
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

      setMaintenanceMode: (value) => set({ maintenanceMode: value }),

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
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        notifications: state.notifications,
        maintenanceMode: state.maintenanceMode,
      }),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const theme = useSettingsStore.getState().theme;
  document.documentElement.classList.toggle('dark', theme === 'dark');
}