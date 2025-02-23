import { supabase } from '../lib/supabase';
import type { Tournament } from '../types';

export const tournamentService = {
  async fetchTournaments() {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTournament(tournament: Omit<Tournament, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('tournaments')
      .insert([{
        ...tournament,
        current_participants: 0,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTournament(id: string, tournament: Partial<Tournament>) {
    try {
      // First verify the tournament exists
      const { data: existingTournament, error: fetchError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!existingTournament) throw new Error('Tournament not found');

      // Proceed with the update
      const { data, error: updateError } = await supabase
        .from('tournaments')
        .update({
          ...tournament,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (!data) throw new Error('Failed to update tournament');

      return data;
    } catch (error) {
      console.error('Tournament update error:', error);
      throw error;
    }
  },

  async deleteTournament(id: string) {
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTournamentById(id: string) {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Tournament not found');

      return data;
    } catch (error) {
      console.error('Error fetching tournament:', error);
      throw error;
    }
  },

  async updateParticipantCount(id: string) {
    try {
      const { data: registrations, error: countError } = await supabase
        .from('registrations')
        .select('id')
        .eq('tournament_id', id)
        .eq('status', 'approved');

      if (countError) throw countError;

      const count = registrations?.length || 0;

      const { error: updateError } = await supabase
        .from('tournaments')
        .update({ current_participants: count })
        .eq('id', id);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating participant count:', error);
      throw error;
    }
  },

  subscribeToTournaments(callback: () => void) {
    return supabase
      .channel('tournaments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        callback
      )
      .subscribe();
  }
};