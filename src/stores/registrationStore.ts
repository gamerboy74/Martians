import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Registration {
  id: string;
  tournament_id: string;
  user_id: string;
  team_name: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface RegistrationState {
  registrations: Registration[];
  loading: boolean;
  error: string | null;
  fetchRegistrations: () => Promise<void>;
  updateRegistrationStatus: (id: string, status: Registration['status']) => Promise<void>;
  subscribeToRegistrations: () => void;
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  registrations: [],
  loading: false,
  error: null,

  fetchRegistrations: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          tournaments (
            title,
            game
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ registrations: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Error fetching registrations:', error);
    } finally {
      set({ loading: false });
    }
  },

  updateRegistrationStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('registrations')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        registrations: state.registrations.map((r) =>
          r.id === id ? { ...r, ...data } : r
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Error updating registration status:', error);
    } finally {
      set({ loading: false });
    }
  },

  subscribeToRegistrations: () => {
    const subscription = supabase
      .channel('registrations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'registrations'
        },
        () => {
          get().fetchRegistrations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}));