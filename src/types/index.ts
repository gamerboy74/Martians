export interface Player {
  id: string;
  username: string;
  rank: number;
  points: number;
  wins: number;
  losses: number;
  avatar: string;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  game: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  prize_pool: string;
  registration_fee: number;
  max_participants: number;
  current_participants: number;
  format: 'solo' | 'duo' | 'squad' | 'team';
  status: 'upcoming' | 'ongoing' | 'completed';
  registration_open: boolean;
  image_url: string;
  qr_code_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Match {
  tournaments: any;
  id: string;
  tournament_id: string;
  round: number;
  player1_id: string;
  player2_id: string;
  score1: number;
  score2: number;
  status: 'scheduled' | 'live' | 'completed';
  start_time: string;
  stream_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  player: Player;
  position: number;
  tournamentPoints: number;
  matchesPlayed: number;
  winRate: number;
}
