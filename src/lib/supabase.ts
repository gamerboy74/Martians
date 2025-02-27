import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'tournament-admin@1.0.0'
    }
  }
});

// Add debug logging for development
if (import.meta.env.DEV) {
  console.log('Supabase client initialized with URL:', supabaseUrl);
}

// Subscribe to real-time updates
export const subscribeToTournaments = (callback: () => void) => {
  const subscription = supabase
    .channel('tournaments')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'tournaments' },
      (payload) => {
        console.log('Tournament change received:', payload);
        callback();
      }
    )
    .subscribe((status) => {
      console.log('Tournament subscription status:', status);
    });

  return () => {
    subscription.unsubscribe();
  };
};

export const subscribeToRegistrations = (callback: () => void) => {
  const subscription = supabase
    .channel('registrations')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'registrations' },
      (payload) => {
        console.log('Registration change received:', payload);
        callback();
      }
    )
    .subscribe((status) => {
      console.log('Registration subscription status:', status);
    });

  return () => {
    subscription.unsubscribe();
  };
};