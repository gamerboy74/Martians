import { supabase } from '../lib/supabase';
import type { Match } from '../types';

export const matchService = {
  async fetchMatches() {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        tournaments (
          title,
          game
        ),
        team1:registrations!team1_id (
          team_name
        ),
        team2:registrations!team2_id (
          team_name
        )
      `)
      .order('start_time', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createMatch(match: Omit<Match, 'id'>) {
    const { data, error } = await supabase
      .from('matches')
      .insert([match])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMatch(id: string, match: Partial<Match>) {
    const { data, error } = await supabase
      .from('matches')
      .update(match)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMatch(id: string) {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  subscribeToMatches(callback: () => void) {
    return supabase
      .channel('matches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        callback
      )
      .subscribe();
  }
};