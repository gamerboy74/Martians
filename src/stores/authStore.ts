import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, User } from '@supabase/supabase-js';
import { authService } from '../services/authService';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
  checkIsAdmin: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      loading: true,
      isAdmin: false,

      signIn: async (email: string, password: string) => {
        try {
          const { session, user } = await authService.signIn(email, password);
          set({ session, user });
          if (session?.user) {
            await get().checkIsAdmin();
          }
        } catch (error) {
          console.error('Sign in error:', error);
          throw error;
        }
      },

      signOut: async () => {
        try {
          await authService.signOut();
          set({ session: null, user: null, isAdmin: false });
        } catch (error) {
          console.error('Sign out error:', error);
          throw error;
        }
      },

      setSession: (session) => {
        set({ 
          session, 
          user: session?.user ?? null,
          loading: false
        });
        if (session?.user) {
          get().checkIsAdmin();
        }
      },

      checkIsAdmin: async () => {
        try {
          const session = await authService.getSession();
          if (!session?.user) {
            set({ isAdmin: false });
            return;
          }

          const isAdmin = await authService.checkIsAdmin(session.user.id);
          set({ isAdmin });
        } catch (error) {
          console.error('Check admin error:', error);
          set({ isAdmin: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        session: state.session,
        user: state.user,
        isAdmin: state.isAdmin
      })
    }
  )
);

// Initialize auth state
authService.getSession().then((session) => {
  useAuthStore.setState({ session, user: session?.user ?? null, loading: false });
  if (session?.user) {
    useAuthStore.getState().checkIsAdmin();
  }
});

// Listen for auth changes
authService.onAuthStateChange((event, session) => {
  useAuthStore.setState({ session, user: session?.user ?? null });
  if (session?.user) {
    useAuthStore.getState().checkIsAdmin();
  }
});