import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Tournament } from '../types';

interface UseTournamentsOptions {
  limit?: number;
  pastOnly?: boolean;
  status?: 'upcoming' | 'ongoing' | 'completed';
}

export function useTournaments({ limit, pastOnly = false, status }: UseTournamentsOptions = {}) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const query = supabase
          .from('tournaments')
          .select('*')
          .order('end_date', { ascending: false });

        if (pastOnly) {
          query.eq('status', 'completed');
        } else if (status) {
          query.eq('status', status);
        } else {
          query.neq('status', 'completed');
        }

        if (limit) {
          query.limit(limit);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setTournaments(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tournaments');
        console.error('Error fetching tournaments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();

    // Subscribe to changes
    const subscription = supabase
      .channel('tournaments_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        () => {
          fetchTournaments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [limit, pastOnly, status]);

  return { tournaments, loading, error };
}