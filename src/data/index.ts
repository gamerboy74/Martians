export const tournaments = [
  {
    id: '1',
    title: 'FIRE SOULS CHAMPIONSHIP',
    game: 'Fire Souls',
    startDate: '2024-04-15',
    endDate: '2024-04-17',
    prizePool: '$10,000',
    maxParticipants: 128,
    currentParticipants: 96,
    status: 'upcoming',
    registrationOpen: true,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop',
    description: 'Join the ultimate Fire Souls tournament and prove your worth in this challenging competition.'
  },
  {
    id: '2',
    title: 'CYBER REALM MASTERS',
    game: 'Cyber Realm',
    startDate: '2024-05-01',
    endDate: '2024-05-03',
    prizePool: '$15,000',
    maxParticipants: 64,
    currentParticipants: 45,
    status: 'upcoming',
    registrationOpen: true,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop',
    description: 'Enter the matrix and compete against the best Cyber Realm players in this high-stakes tournament.'
  }
] as const;

export const leaderboardData = [
  {
    player: {
      id: '1',
      username: 'DragonSlayer',
      rank: 1,
      points: 2500,
      wins: 42,
      losses: 8,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop'
    },
    position: 1,
    tournamentPoints: 2500,
    matchesPlayed: 50,
    winRate: 84
  },
  {
    player: {
      id: '2',
      username: 'ShadowBlade',
      rank: 2,
      points: 2350,
      wins: 38,
      losses: 12,
      avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=80&h=80&fit=crop'
    },
    position: 2,
    tournamentPoints: 2350,
    matchesPlayed: 50,
    winRate: 76
  },
  {
    player: {
      id: '3',
      username: 'PhoenixRising',
      rank: 3,
      points: 2200,
      wins: 36,
      losses: 14,
      avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop'
    },
    position: 3,
    tournamentPoints: 2200,
    matchesPlayed: 50,
    winRate: 72
  }
] as const;