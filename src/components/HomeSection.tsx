import React, { useState, useEffect } from "react";
import { Trophy, Calendar, Users, DollarSign, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { RealtimeChannel } from "@supabase/supabase-js";

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

    const subscription: RealtimeChannel = supabase
      .channel("featured_games_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "featured_games" },
        () => fetchGames()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-purple-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-purple-700 opacity-50"></div>
        </div>
      </div>
    );
  }

  return (
    <section
      id="home"
      className="min-h-screen bg-black relative overflow-hidden pt-16 sm:pt-20"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />

      {/* Hero Content */}
      <div className="relative pt-16 sm:pt-20 md:pt-32 pb-12 sm:pb-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold text-white mb-4 sm:mb-6 leading-tight animate-fade-in">
            WELCOME TO
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              MARTIANS GAMING GUILD
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 md:mb-12 max-w-xl sm:max-w-2xl mx-auto px-4 animate-fade-in">
            Join the ultimate gaming experience. Compete in epic tournaments, watch live battles, and rise to legend status.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 px-4">
            <button
              onClick={scrollToTournaments}
              className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl text-sm sm:text-base"
            >
              <Trophy className="w-4 sm:w-5 h-4 sm:h-5" />
              <span>JOIN TOURNAMENT</span>
            </button>
            <button
              onClick={() => navigate("/schedule")}
              className="w-full sm:w-auto px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-xl text-sm sm:text-base"
            >
              <Calendar className="w-4 sm:w-5 h-4 sm:h-5" />
              <span>VIEW SCHEDULE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Games Slider */}
      <div className="relative px-4 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 sm:mb-12 animate-slide-in">
            FEATURED GAMES
          </h2>

          <Swiper
            effect="coverflow"
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: "auto" },
            }}
            coverflowEffect={{
              rotate: 30,
              stretch: 0,
              depth: 150,
              modifier: 1,
              slideShadows: true,
            }}
            pagination={{ clickable: true }}
            navigation={{ enabled: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
            className="w-full py-8 sm:py-12"
          >
            {games.map((game) => (
              <SwiperSlide key={game.id} className="w-[280px] sm:w-[320px] md:w-[400px]">
                <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-lg shadow-md hover:shadow-purple-500/40 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300" />
                  <img
                    src={game.image_url}
                    alt={game.title}
                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
                    <div className="transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                      <span className="inline-block px-2 sm:px-3 py-1 bg-purple-500/80 text-white text-xs sm:text-sm font-medium rounded-full mb-2 sm:mb-3 shadow-md">
                        {game.category}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">{game.title}</h3>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-gray-300 text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 sm:w-4 h-3 sm:h-4 text-purple-400" />
                          <span>{game.tournaments_count} Tournaments</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 sm:w-4 h-3 sm:h-4 text-purple-400" />
                          <span>{game.players_count} Players</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slide-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.5s ease-out; }
          .animate-slide-in { animation: slide-in 0.5s ease-out; }

          .swiper-slide {
            transition: transform 0.3s;
          }
          .swiper-slide-active {
            transform: scale(1.05);
          }
          .swiper-pagination {
            position: relative;
            margin-top: 1.5rem;
          }
          .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
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