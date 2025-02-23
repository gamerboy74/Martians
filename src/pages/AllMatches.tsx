import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Calendar, Users, DollarSign, ArrowLeft, Medal, Eye } from 'lucide-react';
import { useTournaments } from '../hooks/useTournaments';
import { formatDate } from '../lib/utils';

const AllMatches: React.FC = () => {
  const { tournaments, loading, error } = useTournaments({ status: 'completed' });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">Failed to load tournaments</p>
          <p className="text-gray-400 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-black relative">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />
      
      <div className="relative px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>

          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">
              PAST TOURNAMENTS
            </h2>
            <p className="text-purple-400 text-lg">
              Explore our tournament history and past champions
            </p>
          </div>

          {tournaments.length === 0 ? (
            <div className="text-center py-12 bg-purple-900/20 backdrop-blur-sm rounded-xl">
              <Trophy className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Past Tournaments</h3>
              <p className="text-gray-400">Check back later for tournament history</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-black backdrop-blur-sm 
                  transform transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />
                  
                  <img
                    src={tournament.image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop'}
                    alt={tournament.title}
                    className="w-full h-64 object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-4">
                        <span className="px-3 py-1 bg-purple-500/80 text-white text-sm rounded-full">
                          {tournament.game}
                        </span>
                        <span className="px-3 py-1 bg-yellow-500/80 text-white text-sm rounded-full">
                          Completed
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                        {tournament.title}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar size={16} className="text-purple-400" />
                          <span>{formatDate(tournament.end_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <DollarSign size={16} className="text-purple-400" />
                          <span>{tournament.prize_pool}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Users size={16} className="text-purple-400" />
                          <span>{tournament.current_participants} Players</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Trophy size={16} className="text-purple-400" />
                          <span>{tournament.format.toUpperCase()}</span>
                        </div>
                      </div>
                      
                      <Link
                        to={`/tournament/${tournament.id}/results`}
                        className="w-full py-3 mt-4 rounded-lg text-white font-medium transition-all duration-300 
                          flex items-center justify-center gap-2 border border-purple-500/30 bg-purple-500/20 
                          hover:bg-purple-500/30 group-hover:border-purple-500/50"
                      >
                        <Medal size={18} />
                        <span>VIEW RESULTS</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AllMatches;