import React, { useState, useEffect } from "react";
import {
  Crown,
  Menu,
  X,
  Github,
  Twitter,
  MessageSquare,
  Youtube,
} from "lucide-react";
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
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/90 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between h-20"> {/* Increased height from h-16 to h-20 */}
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <a href="./" className="flex items-center">
                <img
                  src="https://media.discordapp.net/attachments/1334811878714769408/1339557614031212575/MGG-Icon-Dark_2.png?ex=67bef9be&is=67bda83e&hm=9efd76127b5593c7f857e8e61be3228308e6f4141ddd69c8a70ed5b8ee3776f7&=&format=webp&quality=lossless&width=909&height=909"
                  className="h-16 w-auto object-contain transition-all duration-300 hover:brightness-125" // Increased from h-12 to h-16
                  alt="Martians Gaming Guild Logo"
                /> Martians Gaming Guild
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-12 ml-12"> {/* Increased gap-10 to gap-12, ml-10 to ml-12 */}
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.href)}
                  className={`text-sm font-medium tracking-wide transition-colors ${
                    activeSection === item.id
                      ? "text-purple-400"
                      : "text-gray-200 hover:text-purple-400"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Social Icons (Desktop) */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="https://www.youtube.com/@Martiansgaminguild"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-purple-400 transition-colors"
              >
                <Youtube size={24} /> {/* Increased size from 22 to 24 */}
              </a>
              <a
                href="https://x.com/MartiansGGC"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-purple-400 transition-colors"
              >
                <Twitter size={24} />
              </a>
              <a
                href="https://discord.gg/CAUzxzfXMx"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-purple-400 transition-colors"
              >
                <FaDiscord size={24} />
              </a>
              <a
                href="https://chat.whatsapp.com/FR4YzZMFQorHKgqHcduHFs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-purple-400 transition-colors"
              >
                <FaWhatsapp size={24} />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden text-gray-200 hover:text-purple-400 transition-colors"
            >
              <Menu size={30} /> {/* Increased size from 28 to 30 */}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black/95 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="h-full flex flex-col p-6">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-200 hover:text-purple-400 transition-colors self-end"
          >
            <X size={30} /> {/* Increased size from 28 to 30 */}
          </button>

          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            <Crown size={64} className="text-purple-400 mb-6" />
            <div className="space-y-6 text-center">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.href)}
                  className={`block text-lg font-medium tracking-wide transition-colors ${
                    activeSection === item.id
                      ? "text-purple-400"
                      : "text-gray-200 hover:text-purple-400"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-8 pb-6">
            <a
              href="https://www.youtube.com/@Martiansgaminguild"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:text-purple-400 transition-colors"
            >
              <Youtube size={24} />
            </a>
            <a
              href="https://x.com/MartiansGGC"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:text-purple-400 transition-colors"
            >
              <Twitter size={24} />
            </a>
            <a
              href="https://chat.whatsapp.com/FR4YzZMFQorHKgqHcduHFs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:text-purple-400 transition-colors"
            >
              <FaWhatsapp size={24} />
            </a>
            <a
              href="https://discord.gg/CAUzxzfXMx"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-200 hover:text-purple-400 transition-colors"
            >
              <FaDiscord size={24} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;