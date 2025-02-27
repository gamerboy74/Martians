import React, { useState, useEffect } from "react";
import { Trophy, Calendar, Users, DollarSign, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import {
  EffectCoverflow,
  Pagination,
  Navigation,
  Autoplay,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

interface FeaturedGame {
  id: string;
  title: string;
  category: string;
  image_url: string;
  tournaments_count: number;
  players_count: string;
}

const HomeSection: React.FC = () => {
  const [games, setGames] = useState<FeaturedGame[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const scrollToTournaments = () => {
    const element = document.getElementById("tournaments");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("featured_games")
          .select("*")
          .order("sort_order");

        if (error) throw error;
        setGames(data || []);
      } catch (error) {
        console.error("Error fetching featured games:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();

    const subscription = supabase
      .channel("featured_games_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "featured_games" },
        () => {
          fetchGames();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <section
      id="home"
      className="min-h-screen bg-black relative overflow-hidden pt-20"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />

      {/* Hero Content */}
      <div className="relative pt-20 md:pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 leading-tight">
            WELCOME TO
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              MARTIANS GAMING GUILD
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 md:mb-12 max-w-2xl mx-auto px-4">
            Join the ultimate gaming experience. Compete in tournaments, watch
            live matches, and become a legend.
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 px-4">
            <button
              onClick={scrollToTournaments}
              className="w-full md:w-auto px-6 md:px-8 py-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-white 
                font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Trophy size={20} />
              <span>JOIN TOURNAMENT</span>
            </button>
            <button
              onClick={() => navigate('/schedule')}
              className="w-full md:w-auto px-6 md:px-8 py-4 bg-purple-500/20 hover:bg-purple-500/30 border 
                border-purple-500/30 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Calendar size={20} />
              <span>VIEW SCHEDULE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Games Slider */}
      <div className="relative px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            FEATURED GAMES
          </h2>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <Swiper
              effect="coverflow"
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={1}
              breakpoints={{
                640: {
                  slidesPerView: "auto"
                }
              }}
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              pagination={{ clickable: true }}
              navigation={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
              className="w-full py-12"
            >
              {games.map((game) => (
                <SwiperSlide key={game.id} className="w-[300px] sm:w-[400px]">
                  <div className="group relative overflow-hidden rounded-xl bg-purple-900/20 backdrop-blur-sm">
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-60 
                      transition-opacity group-hover:opacity-40"
                    />

                    <img
                      src={game.image_url}
                      alt={game.title}
                      className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop";
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
                        <div className="flex items-center gap-4 text-gray-300 text-sm">
                          <div className="flex items-center gap-1">
                            <Trophy size={16} className="text-purple-400" />
                            <span>{game.tournaments_count} Tournaments</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={16} className="text-purple-400" />
                            <span>{game.players_count} Players</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
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

          @media (max-width: 640px) {
            .swiper-button-prev,
            .swiper-button-next {
              display: none;
            }
          }
        `}
      </style>
    </section>
  );
};

export default HomeSection;