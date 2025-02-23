import React, { useState, useEffect } from 'react';
import { Crown, Menu, X, Github, Twitter, Twitch } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { id: 'home', label: 'HOME', href: '#home' },
  { id: 'tournaments', label: 'TOURNAMENTS', href: '#tournaments' },
  { id: 'matches', label: 'MATCHES', href: '#matches' },
  { id: 'leaderboard', label: 'LEADERBOARD', href: '#leaderboard' }
];

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => ({
        id: item.id,
        offset: document.getElementById(item.id)?.offsetTop || 0
      }));

      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        if (scrollPosition >= sections[i].offset) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(href);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12">
              <Crown size={32} className="text-purple-400" />
              <div className="hidden md:flex items-center gap-8">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.href)}
                    className={`text-sm tracking-wider transition-colors ${
                      activeSection === item.id
                        ? 'text-purple-400'
                        : 'text-white hover:text-purple-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#" className="text-white hover:text-purple-400 transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-white hover:text-purple-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-white hover:text-purple-400 transition-colors">
                <Twitch size={20} />
              </a>
            </div>
            
            <button
              onClick={() => setIsMenuOpen(true)}
              className="text-white hover:text-purple-400 transition-colors md:hidden"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black/95 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="h-full flex flex-col p-8">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-white hover:text-purple-400 transition-colors self-end"
          >
            <X size={24} />
          </button>

          <div className="flex-1 flex flex-col items-center justify-center">
            <Crown size={64} className="text-purple-400 mb-8" />
            <div className="space-y-6 text-center">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.href)}
                  className={`block text-lg tracking-wider transition-colors ${
                    activeSection === item.id
                      ? 'text-purple-400'
                      : 'text-white hover:text-purple-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-6">
            <a href="#" className="text-white hover:text-purple-400 transition-colors">
              <Github size={20} />
            </a>
            <a href="#" className="text-white hover:text-purple-400 transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-white hover:text-purple-400 transition-colors">
              <Twitch size={20} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;