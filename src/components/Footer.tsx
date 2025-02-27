import React from "react";
import { Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import { FaDiscord, FaWhatsapp } from "react-icons/fa";

const Footer: React.FC<{}> = () => {
  return (
    <footer className="relative bg-transparent pt-16 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Brand Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-2">
              <a href="./" className="flex items-center group">
                <img
                  src="https://media.discordapp.net/attachments/1334811878714769408/1339557614031212575/MGG-Icon-Dark_2.png?ex=67bef9be&is=67bda83e&hm=9efd76127b5593c7f857e8e61be3228308e6f4141ddd69c8a70ed5b8ee3776f7&=&format=webp&quality=lossless&width=909&height=909"
                  className="h-12 sm:h-16 w-auto object-contain transition-all duration-300 group-hover:brightness-125 group-hover:scale-105"
                  alt="Martians Gaming Guild Logo"
                />
                <span className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                  Martians Gaming Guild
                </span>
              </a>
            </div>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed animate-fade-in">
              A sustainable platform bridging passionate gamers with Web3 E-Sport industries and companies.
            </p>
            <div className="flex items-center gap-4 sm:gap-6 ">
              <a
                href="https://x.com/MartiansGGC"
                className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-110"
              >
                <Twitter size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href="https://www.youtube.com/@Martiansgaminguild"
                className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-110"
              >
                <Youtube size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href="https://discord.gg/CAUzxzfXMx"
                className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-110"
              >
                <FaDiscord size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href="https://chat.whatsapp.com/FR4YzZMFQorHKgqHcduHFs"
                className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-110"
              >
                <FaWhatsapp size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg sm:text-xl mb-4 sm:mb-6 animate-slide-in">QUICK LINKS</h3>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { name: "About Us", path: "/about-us" },
                { name: "Tournaments", path: "/tournaments" },
                { name: "Schedule", path: "/schedule" },
                { name: "Matches", path: "/past-matches" },
                { name: "Contact Us", path: "/contact-us" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-gray-300 text-sm sm:text-base hover:text-purple-400 transition-all duration-300 hover:translate-x-1"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-lg sm:text-xl mb-4 sm:mb-6 animate-slide-in">CONTACT INFO</h3>
            <ul className="space-y-3 sm:space-y-4">
              <li className="flex items-start gap-2 sm:gap-3">
                <MapPin size={20} className="text-purple-400 shrink-0 mt-1 w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-gray-300 text-sm sm:text-base">
                  MadhuSudhanNagar, Jatni
                  <br />
                  Khordha, Bhubaneswar 752050
                </span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Phone size={20} className="text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-gray-300 text-sm sm:text-base">+91 9329725090</span>
              </li>
              <li className="flex items-center gap-2 sm:gap-3">
                <Mail size={20} className="text-purple-400 w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-gray-300 text-sm sm:text-base">martiansgamingguild@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold text-lg sm:text-xl mb-4 sm:mb-6 animate-slide-in">NEWSLETTER</h3>
            <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">
              Get the latest updates on tournaments and events.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-purple-900/30 border border-purple-500/40 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/70 transition-all duration-300 backdrop-blur-sm text-sm sm:text-base"
              />
              <button
                type="submit"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg text-white font-semibold transition-all duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-purple-500/30">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 text-center sm:text-left">
            <div className="text-gray-400 text-xs sm:text-sm">
              © {new Date().getFullYear()} MGG. All rights reserved.
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 text-xs sm:text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 text-xs sm:text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-all duration-300 hover:translate-x-1 text-xs sm:text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
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
        `}
      </style>
    </footer>
  );
};

export default Footer;