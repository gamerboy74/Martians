import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Match } from '../types';

interface MatchState {
  matches: Match[];
  loading: boolean;
  error: string | null;
  fetchMatches: () => Promise<void>;
  createMatch: (match: Omit<Match, 'id'>) => Promise<void>;
  updateMatch: (id: string, match: Partial<Match>) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  subscribeToMatches: () => () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  loading: false,
  error: null,

  fetchMatches: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          tournaments (
            title,
            game
          ),
          team1:registrations!team1_id (
            team_name,
            logo_url
          ),
          team2:registrations!team2_id (
            team_name,
            logo_url
          )
        `)
        .order('start_time', { ascending: true });

      if (error) throw error;
      set({ matches: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Error fetching matches:', error);
    } finally {
      set({ loading: false });
    }
  },

  createMatch: async (match) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([match])
        .select(`
          *,
          tournaments (
            title,
            game
          ),
          team1:registrations!team1_id (
            team_name,
            logo_url
          ),
          team2:registrations!team2_id (
            team_name,
            logo_url
          )
        `)
        .single();

      if (error) throw error;
      set((state) => ({
        matches: [data, ...state.matches]
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Error creating match:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateMatch: async (id, match) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('matches')
        .update(match)
        .eq('id', id)
        .select(`
          *,
          tournaments (
            title,
            game
          ),
          team1:registrations!team1_id (
            team_name,
            logo_url
          ),
          team2:registrations!team2_id (
            team_name,
            logo_url
          )
        `)
        .single();

      if (error) throw error;
      set((state) => ({
        matches: state.matches.map((m) =>
          m.id === id ? { ...m, ...data } : m
        )
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Error updating match:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteMatch: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set((state) => ({
        matches: state.matches.filter((m) => m.id !== id)
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      console.error('Error deleting match:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  subscribeToMatches: () => {
    const subscription = supabase
      .channel('matches')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => {
          get().fetchMatches();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}));