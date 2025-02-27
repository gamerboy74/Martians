import React from "react";
import {
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";
import { FaDiscord, FaWhatsapp } from "react-icons/fa";

const Footer: React.FC<{}> = () => {
  return (
    <footer className="relative bg-transparent pt-24 pb-12 px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/20 to-black pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <a href="./" className="flex items-center">
                <img
                  src="https://media.discordapp.net/attachments/1334811878714769408/1339557614031212575/MGG-Icon-Dark_2.png?ex=67bef9be&is=67bda83e&hm=9efd76127b5593c7f857e8e61be3228308e6f4141ddd69c8a70ed5b8ee3776f7&=&format=webp&quality=lossless&width=909&height=909"
                  className="h-16 w-auto object-contain transition-all duration-300 hover:brightness-125"
                  alt="Martians Gaming Guild Logo"
                />
              </a>
              <span className="text-2xl font-bold text-white">Martians gaming guild</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Martians gaming guild is a sustainable and scalable platform that
              serves as a bridge between passionate gamers and E-Sport
              Industries and Companies in Web3.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://x.com/MartiansGGC"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://www.youtube.com/@Martiansgaminguild"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                <Youtube size={20} />
              </a>
              <a
                href="https://discord.gg/CAUzxzfXMx"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                <FaDiscord size={20} />
              </a>
              <a
                href="https://chat.whatsapp.com/FR4YzZMFQorHKgqHcduHFs"
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6">QUICK LINKS</h3>
            <ul className="space-y-3">
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
                    className="text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    {item.name}
                  </Link>
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
                  MadhuSudhanNagar, Jatni
                  <br />
                  Khordha, Bhubaneswar 752050
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-purple-400" />
                <span className="text-gray-400">+91 9329725090</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-purple-400" />
                <span className="text-gray-400">martiansgamingguild@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-bold mb-6">NEWSLETTER</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter and get the latest updates about
              tournaments and events.
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
              © 2025 MGG. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
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