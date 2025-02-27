import React, { useState, useEffect } from "react";
import { Crown, Menu, X, Github, Twitter, MessageSquare, Youtube } from "lucide-react";
import { FaDiscord, FaWhatsapp } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { id: "home", label: "HOME", href: "#home" },
  { id: "tournaments", label: "TOURNAMENTS", href: "#tournaments" },
  { id: "matches", label: "MATCHES", href: "#matches" },
  { id: "leaderboard", label: "LEADERBOARD", href: "#leaderboard" },
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map((item) => ({
        id: item.id,
        offset: document.getElementById(item.id)?.offsetTop || 0,
      }));

      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollPosition >= sections[i].offset) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/95 backdrop-blur-lg shadow-lg shadow-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <div className="flex-shrink-0 flex items-center">
              <a href="./" className="flex items-center gap-2 group">
                <img
                  src="https://gvmsopxbjhntcublylxu.supabase.co/storage/v1/object/public/Logo_mgg//MGG-Icon-Dark_2.webp"
                  className="h-12 sm:h-16 w-auto object-contain transition-all duration-300 group-hover:brightness-125 group-hover:scale-105"
                  alt="Martians Gaming Guild Logo"
                />
                <span className="text-white font-bold text-lg sm:text-xl tracking-wide hidden sm:block group-hover:text-purple-400 transition-colors">
                  Martians Gaming Guild
                </span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 lg:gap-12 ml-8 lg:ml-12">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.href)}
                  className={`text-sm lg:text-base font-semibold tracking-wider transition-all duration-300 relative ${
                    activeSection === item.id
                      ? "text-purple-400 after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-purple-400 after:animate-underline"
                      : "text-gray-200 hover:text-purple-400"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Social Icons (Desktop) */}
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <a
                href="https://www.youtube.com/@Martiansgaminguild"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-purple-400 transition-all duration-300 hover:scale-110"
              >
                <Youtube size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href="https://x.com/MartiansGGC"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-purple-400 transition-all duration-300 hover:scale-110"
              >
                <Twitter size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href="https://discord.gg/CAUzxzfXMx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-purple-400 transition-all duration-300 hover:scale-110"
              >
                <FaDiscord size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
              <a
                href="https://chat.whatsapp.com/FR4YzZMFQorHKgqHcduHFs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-purple-400 transition-all duration-300 hover:scale-110"
              >
                <FaWhatsapp size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden text-gray-200 hover:text-purple-400 transition-all duration-300 hover:scale-110"
            >
              <Menu size={24} className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-gradient-to-b from-black via-purple-900/90 to-black z-50 transition-all duration-300 transform ${
          isMenuOpen ? "translate-x-0 opacity-100 pointer-events-auto" : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="h-full flex flex-col p-6">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-200 hover:text-purple-400 transition-all duration-300 hover:scale-110 self-end"
          >
            <X size={24} className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <div className="flex-1 flex flex-col items-center justify-center gap-8 sm:gap-10">
            <Crown size={40} className="sm:size-48 text-purple-400 mb-4 sm:mb-6 animate-pulse" />
            <div className="space-y-6 sm:space-y-8 text-center">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.href)}
                  className={`block text-lg sm:text-xl font-semibold tracking-wider transition-all duration-300 ${
                    activeSection === item.id
                      ? "text-purple-400 relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-purple-400 after:animate-underline"
                      : "text-gray-200 hover:text-purple-400"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-6 sm:gap-8 pb-6">
            <a
              href="https://www.youtube.com/@Martiansgaminguild"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:text-purple-400 transition-all duration-300 hover:scale-110"
            >
              <Youtube size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
            <a
              href="https://x.com/MartiansGGC"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:text-purple-400 transition-all duration-300 hover:scale-110"
            >
              <Twitter size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
            <a
              href="https://chat.whatsapp.com/FR4YzZMFQorHKgqHcduHFs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:text-purple-400 transition-all duration-300 hover:scale-110"
            >
              <FaWhatsapp size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
            <a
              href="https://discord.gg/CAUzxzfXMx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:text-purple-400 transition-all duration-300 hover:scale-110"
            >
              <FaDiscord size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            </a>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes underline {
            from { width: 0; }
            to { width: 100%; }
          }
          .animate-underline {
            animation: underline 0.3s ease-out forwards;
          }
        `}
      </style>
    </>
  );
};

export default Navbar;