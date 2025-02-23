export interface Database {
  public: {
    Tables: {
      tournaments: {
        Row: {
          id: string;
          title: string;
          game: string;
          start_date: string;
          end_date: string;
          prize_pool: string;
          max_participants: number;
          current_participants: number;
          status: 'upcoming' | 'ongoing' | 'completed';
          registration_open: boolean;
          image_url: string | null;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tournaments']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tournaments']['Insert']>;
      };
      registrations: {
        Row: {
          id: string;
          tournament_id: string;
          user_id: string;
          team_name: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['registrations']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['registrations']['Insert']>;
      };
      matches: {
        Row: {
          id: string;
          tournament_id: string;
          round: number;
          player1_id: string | null;
          player2_id: string | null;
          score1: number;
          score2: number;
          status: 'scheduled' | 'live' | 'completed';
          start_time: string;
          stream_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['matches']['Insert']>;
      };
    };
  };
}