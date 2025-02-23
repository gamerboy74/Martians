import React from 'react';
import { Play } from 'lucide-react';

const EventSection: React.FC = () => {
  return (
    <section className="min-h-screen bg-transparent px-8 py-24 relative overflow-hidden">
      <div className="gradient-overlay" />
      
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-purple-500/20 animate-float"
              style={{
                width: Math.random() * 100 + 50 + 'px',
                height: Math.random() * 100 + 50 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 5 + 's',
                animationDuration: Math.random() * 10 + 15 + 's'
              }}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
          <div className="lg:w-1/2 space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm tracking-wider">#WEAREGAMERS</span>
            </div>
            <h2 className="text-5xl font-bold text-white">
              KINGSCON 2024<br />
              THE BEST ONE YET!
            </h2>
            <div className="relative">
              <div className="form-glass p-8 space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  Join us for the ultimate gaming experience at KINGSCON 2024. Immerse yourself in 
                  competitive tournaments, exclusive game reveals, and unforgettable moments with 
                  fellow gamers. This year's event promises to be our most spectacular yet, featuring 
                  world-class competitions, industry legends, and cutting-edge gaming technology.
                </p>
                <button className="contact-button">
                  <span>LEARN MORE</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-900 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
              <div className="relative aspect-video overflow-hidden rounded-lg">
                <img 
                  src="https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1920&h=1080&fit=crop" 
                  alt="Event Preview" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-20 h-20 rounded-full bg-purple-600 hover:bg-purple-700 transition-all duration-300 flex items-center justify-center group/play">
                      <Play size={32} className="text-white ml-1 group-hover/play:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventSection;