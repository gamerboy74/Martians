import { create } from 'zustand';
import type { Tournament } from '../types';
import { tournamentService } from '../services/tournamentService';

interface TournamentState {
  tournaments: Tournament[];
  selectedTournament: Tournament | null;
  loading: boolean;
  error: string | null;
  fetchTournaments: () => Promise<void>;
  createTournament: (tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTournament: (id: string, tournament: Partial<Tournament>) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  getTournamentById: (id: string) => Promise<void>;
  subscribeToTournaments: () => () => void;
  setSelectedTournament: (tournament: Tournament | null) => void;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  tournaments: [],
  selectedTournament: null,
  loading: false,
  error: null,

  setSelectedTournament: (tournament) => set({ selectedTournament: tournament }),

  fetchTournaments: async () => {
    set({ loading: true, error: null });
    try {
      const data = await tournamentService.fetchTournaments();
      set({ tournaments: data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tournaments';
      set({ error: message });
      console.error('Error fetching tournaments:', error);
    } finally {
      set({ loading: false });
    }
  },

  createTournament: async (tournament) => {
    set({ loading: true, error: null });
    try {
      const data = await tournamentService.createTournament(tournament);
      set((state) => ({
        tournaments: [data, ...state.tournaments]
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create tournament';
      set({ error: message });
      console.error('Error creating tournament:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateTournament: async (id, tournament) => {
    set({ loading: true, error: null });
    try {
      const data = await tournamentService.updateTournament(id, tournament);
      set((state) => ({
        tournaments: state.tournaments.map((t) =>
          t.id === id ? { ...t, ...data } : t
        ),
        selectedTournament: state.selectedTournament?.id === id ? data : state.selectedTournament
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update tournament';
      set({ error: message });
      console.error('Error updating tournament:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteTournament: async (id) => {
    set({ loading: true, error: null });
    try {
      await tournamentService.deleteTournament(id);
      set((state) => ({
        tournaments: state.tournaments.filter((t) => t.id !== id),
        selectedTournament: state.selectedTournament?.id === id ? null : state.selectedTournament
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete tournament';
      set({ error: message });
      console.error('Error deleting tournament:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getTournamentById: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await tournamentService.getTournamentById(id);
      set({ selectedTournament: data });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tournament';
      set({ error: message });
      console.error('Error fetching tournament:', error);
    } finally {
      set({ loading: false });
    }
  },

  subscribeToTournaments: () => {
    const subscription = tournamentService.subscribeToTournaments(() => {
      get().fetchTournaments();
    });
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }
}));