import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';
import { supabase } from '../lib/supabase';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface FeaturedGame {
  id: string;
  title: string;
  category: string;
  image_url: string;
  tournaments_count: number;
  players_count: string;
}

const CoverflowSlider: React.FC = () => {
  const [games, setGames] = useState<FeaturedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const { data, error } = await supabase
          .from('featured_games')
          .select('*')
          .order('sort_order');

        if (error) throw error;
        setGames(data || []);
      } catch (error) {
        console.error('Error fetching featured games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();

    // Subscribe to changes
    const subscription = supabase
      .channel('featured_games_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'featured_games' },
        () => {
          fetchGames();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen bg-black overflow-hidden px-4 py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">
            FEATURED GAMES
          </h2>
          <p className="text-purple-400 text-lg">
            Discover our latest and most popular titles
          </p>
        </div>

        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView="auto"
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true
          }}
          pagination={{ clickable: true }}
          navigation={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false
          }}
          modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
          className="w-full py-12"
        >
          {games.map((game) => (
            <SwiperSlide key={game.id} className="w-[300px] sm:w-[400px]">
              <div className="group relative overflow-hidden rounded-xl bg-purple-900/20 backdrop-blur-sm transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 transition-opacity group-hover:opacity-40" />
                
                <img
                  src={game.image_url}
                  alt={game.title}
                  className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop';
                  }}
                />
                
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                    <span className="inline-block px-3 py-1 bg-purple-500/80 text-white text-sm rounded-full mb-3">
                      {game.category}
                    </span>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {game.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-300">
                      <span>{game.tournaments_count} Tournaments</span>
                      <span>{game.players_count} Players</span>
                    </div>
                    <button className="inline-flex items-center gap-2 text-white hover:text-purple-400 transition-colors mt-4">
                      <span>Learn More</span>
                      <svg
                        className="w-4 h-4 transform transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style>
        {`
          .swiper-slide {
            transition: transform 0.3s;
          }
          
          .swiper-slide-active {
            transform: scale(1.1);
          }
          
          .swiper-pagination {
            position: relative;
            margin-top: 2rem;
          }
          
          .swiper-pagination-bullet {
            width: 10px;
            height: 10px;
            background: rgba(139, 92, 246, 0.5);
            opacity: 0.5;
          }
          
          .swiper-pagination-bullet-active {
            background: #8B5CF6;
            opacity: 1;
          }
          
          .swiper-button-prev,
          .swiper-button-next {
            color: #8B5CF6;
            transition: all 0.3s;
          }
          
          .swiper-button-prev:hover,
          .swiper-button-next:hover {
            color: #A78BFA;
            transform: scale(1.1);
          }
        `}
      </style>
    </section>
  );
};

export default CoverflowSlider;