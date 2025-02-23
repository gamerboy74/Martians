import React from 'react';
import { Ticket, ArrowRight } from 'lucide-react';

const TicketsSection: React.FC = () => {
  return (
    <section className="min-h-screen bg-transparent px-8 py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black pointer-events-none" />
      
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
        <div className="text-center space-y-8">
          <h2 className="text-7xl font-bold text-white leading-tight">
            JOIN US AT KINGSCON!<br />
            FIND TICKETS NOW!
          </h2>
          
          <div className="flex justify-center mt-12">
            <button className="group relative overflow-hidden rounded-lg text-white">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-900 transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent_50%)]" />
              <div className="relative px-8 py-4 flex items-center gap-3">
                <Ticket className="w-5 h-5" />
                <span className="text-lg font-medium">GET TICKETS</span>
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="absolute inset-0 border border-purple-400/30 rounded-lg" />
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "EARLY BIRD", price: "$59", features: ["Full Event Access", "Exclusive Merch", "Priority Seating"] },
              { title: "REGULAR", price: "$89", features: ["Full Event Access", "Standard Merch", "Regular Seating"] },
              { title: "VIP", price: "$159", features: ["Full Event Access", "Premium Merch", "VIP Lounge Access", "Meet & Greet"] }
            ].map((ticket, index) => (
              <div
                key={index}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-purple-900/10 backdrop-blur-sm rounded-xl transition-colors group-hover:from-purple-900/30 group-hover:to-purple-900/20" />
                <div className="relative p-8 text-center space-y-4">
                  <h3 className="text-2xl font-bold text-white">{ticket.title}</h3>
                  <div className="text-4xl font-bold text-purple-400">{ticket.price}</div>
                  <ul className="space-y-2">
                    {ticket.features.map((feature, i) => (
                      <li key={i} className="text-gray-300">{feature}</li>
                    ))}
                  </ul>
                  <button className="mt-6 w-full py-3 px-6 rounded-lg text-white border border-purple-500/30 transition-colors hover:bg-purple-500/20">
                    SELECT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) scale(1);
              opacity: 0.2;
            }
            50% {
              transform: translateY(-100px) scale(1.1);
              opacity: 0.3;
            }
          }

          .animate-float {
            animation: float linear infinite;
          }
        `}
      </style>
    </section>
  );
};

export default TicketsSection;