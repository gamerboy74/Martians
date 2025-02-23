import React from 'react';
import { Crown, Mail, MapPin, Phone, Github, Twitter, Youtube, Twitch } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-transparent pt-24 pb-12 px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Crown size={32} className="text-purple-400" />
              <span className="text-2xl font-bold text-white">KINGSCON</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Join the ultimate gaming experience at KINGSCON 2024. Compete, connect, and celebrate 
              with gamers from around the world.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Youtube size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                <Twitch size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6">QUICK LINKS</h3>
            <ul className="space-y-3">
              {['About Us', 'Tournaments', 'Schedule', 'News & Updates', 'Contact'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-6">CONTACT INFO</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-purple-400 shrink-0 mt-1" />
                <span className="text-gray-400">
                  123 Gaming Street<br />
                  Los Angeles, CA 90001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-purple-400" />
                <span className="text-gray-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-purple-400" />
                <span className="text-gray-400">contact@kingscon.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-6">NEWSLETTER</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter and get the latest updates about tournaments and events.
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-lg 
                text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500/50
                transition-colors backdrop-blur-sm"
              />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 border 
                border-purple-500/30 rounded-lg text-white font-medium transition-colors"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-purple-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2024 KINGSCON. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;