import React from 'react';
import { DollarSign, Users, Monitor, Trophy } from 'lucide-react';
import { FaRupeeSign } from 'react-icons/fa';

interface Tournament {
  id: number;
  title: string;
  date: string;
  time: string;
  game: string;
  image: string;
  prize: string;
  mode: string;
  platform: string;
  slots: string;
}

const tournaments: Tournament[] = [
  {
    id: 1,
    title: "FALL SEASON 2019",
    date: "18TH OCTOBER 2019",
    time: "16:00",
    game: "DOTA 2",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop",
    prize: "35K",
    mode: "5V5",
    platform: "PC",
    slots: "54/54"
  },
  {
    id: 2,
    title: "WINTER SEASON 2020",
    date: "14TH JANUARY 2020",
    time: "16:00",
    game: "TEKKEN 7",
    image: "https://images.unsplash.com/photo-1542751110-97427bbecf20?w=800&h=400&fit=crop",
    prize: "50K",
    mode: "1V1",
    platform: "PS4",
    slots: "33/34"
  },
  {
    id: 3,
    title: "SUMMER SEASON 2020",
    date: "9TH JULY 2020",
    time: "16:00",
    game: "CS:GO",
    image: "https://images.unsplash.com/photo-1542751371-6533d324b6eb?w=800&h=400&fit=crop",
    prize: "25K",
    mode: "5V5",
    platform: "PC",
    slots: "65/70"
  }
];

const TournamentCard: React.FC<{ tournament: Tournament }> = ({ tournament }) => {
  return (
    <div className="tournament-card group relative overflow-hidden rounded-lg">
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
      <img 
        src={tournament.image} 
        alt={tournament.title}
        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
      />
      
      <div className="absolute inset-0 z-20 p-6 flex flex-col justify-between">
        <div>
          <div className="text-sm text-purple-400 mb-2">
            {tournament.date} / {tournament.time} / {tournament.game}
          </div>
          <h3 className="text-2xl font-bold text-white mb-4 tournament-title">
            {tournament.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="tournament-stat">
            <FaRupeeSign size={16} className="text-purple-400" />
            <span>{tournament.prize}</span>
          </div>
          <div className="tournament-stat">
            <Users size={16} className="text-purple-400" />
            <span>{tournament.mode}</span>
          </div>
          <div className="tournament-stat">
            <Monitor size={16} className="text-purple-400" />
            <span>{tournament.platform}</span>
          </div>
          <div className="tournament-stat">
            <Trophy size={16} className="text-purple-400" />
            <span>{tournament.slots}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactForm: React.FC = () => {
  return (
    <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-6">
        <h2 className="text-4xl font-bold text-white">
          CONTACT US <span className="text-purple-400">ABOUT PRESS MATTERS,</span><br />
          POTENTIAL <span className="text-purple-400">SPONSORSHIPS,</span><br />
          AND TEAM <span className="text-purple-400">ADMISSION REQUESTS</span>
        </h2>
        <button className="contact-button">
          <span>CONTACT US</span>
        </button>
      </div>

      <form className="contact-form">
        <div className="form-glass">
          <textarea
            placeholder="Write Message"
            className="form-input min-h-[200px]"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Your Name"
              className="form-input"
            />
            <input
              type="email"
              placeholder="Your Mail"
              className="form-input"
            />
          </div>
          <button type="submit" className="submit-button">
            SUBMIT MESSAGE
          </button>
        </div>
      </form>
    </div>
  );
};

const TournamentsSection: React.FC = () => {
  return (
    <section className="min-h-screen bg-transparent px-8 py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black pointer-events-none" />
      
      <style>
        {`
          .tournament-card {
            @apply bg-purple-900/20 backdrop-blur-sm h-[300px];
          }

          .tournament-card::after {
            content: '';
            @apply absolute inset-0 opacity-0 transition-opacity duration-300;
            background: linear-gradient(45deg, rgba(139, 92, 246, 0.2), rgba(0, 0, 0, 0));
          }

          .tournament-card:hover::after {
            @apply opacity-100;
          }

          .tournament-title {
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
          }

          .tournament-stat {
            @apply flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full text-white backdrop-blur-sm;
          }

          .contact-form {
            @apply relative;
          }

          .form-glass {
            @apply space-y-6 p-8 rounded-2xl relative overflow-hidden;
            background: rgba(88, 28, 135, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(139, 92, 246, 0.1);
            box-shadow: 
              0 4px 24px -1px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(139, 92, 246, 0.1) inset;
          }

          .form-glass::before {
            content: '';
            @apply absolute inset-0 opacity-30;
            background: radial-gradient(
              circle at top right,
              rgba(139, 92, 246, 0.2),
              transparent 40%
            );
          }

          .form-input {
            @apply w-full bg-white/5 border border-purple-500/10 rounded-lg p-4 text-white 
            placeholder:text-gray-400 focus:outline-none focus:border-purple-500/30 
            transition-all duration-300 resize-none backdrop-blur-sm;
            box-shadow: 0 2px 10px -1px rgba(0, 0, 0, 0.1);
          }

          .form-input:focus {
            @apply bg-white/10;
            box-shadow: 
              0 4px 20px -2px rgba(139, 92, 246, 0.1),
              0 0 0 2px rgba(139, 92, 246, 0.1);
          }

          .contact-button {
            @apply inline-flex px-8 py-3 text-white border border-purple-500/30 rounded-lg 
            relative overflow-hidden transition-all duration-300 hover:text-black backdrop-blur-sm;
            background: rgba(139, 92, 246, 0.1);
          }

          .contact-button::before {
            content: '';
            @apply absolute inset-0 bg-purple-500 -translate-x-full transition-transform duration-300;
          }

          .contact-button:hover::before {
            @apply translate-x-0;
          }

          .contact-button span {
            @apply relative z-10;
          }

          .submit-button {
            @apply w-full py-4 text-white rounded-lg relative overflow-hidden
            transition-all duration-300;
            background: linear-gradient(45deg, #9333ea, #7c3aed);
          }

          .submit-button::before {
            content: '';
            @apply absolute inset-0 opacity-0 transition-opacity duration-300;
            background: linear-gradient(45deg, #7c3aed, #9333ea);
          }

          .submit-button:hover::before {
            @apply opacity-100;
          }

          .submit-button::after {
            content: '';
            @apply absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
            -translate-x-full hover:translate-x-full transition-transform duration-700;
          }
        `}
      </style>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm tracking-wider">#TOURNAMENTS</span>
            <h2 className="text-4xl font-bold text-white tracking-wide">
              TOURNAMENTS<br />
              YOU'LL BE WATCHING
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>

        <ContactForm />
      </div>
    </section>
  );
};

export default TournamentsSection;