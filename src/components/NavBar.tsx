
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { scrollToSection } from '@/utils/scrollUtils';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (id === 'about') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      scrollToSection(id);
    }
    if (isOpen) setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-gradient-primary shadow-sm' : 'bg-gradient-primary'
    )}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center space-x-2 ml-4">
            <img 
              src="/lovable-uploads/2cf42ed0-f6e4-4dfe-86bf-e7063fa5e246.png" 
              alt="big Logo" 
              className="h-12 md:h-16" 
            />
          </a>

          <nav className="hidden md:flex items-center space-x-8 mr-4">
            <a 
              href="#about" 
              className="text-white/80 hover:text-white transition-colors text-lg font-light"
              onClick={(e) => handleNavClick(e, 'about')}
            >
              About
            </a>
            <a 
              href="#games" 
              className="text-white/80 hover:text-white transition-colors text-lg font-light"
              onClick={(e) => handleNavClick(e, 'games')}
            >
              Games
            </a>
            <a 
              href="#careers" 
              className="text-white/80 hover:text-white transition-colors text-lg font-light"
              onClick={(e) => handleNavClick(e, 'careers')}
            >
              Careers
            </a>
          </nav>

          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div className={cn(
        "absolute top-full left-0 right-0 bg-gradient-primary shadow-md md:hidden transition-all duration-300 overflow-hidden",
        isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          <a 
            href="#about" 
            className="py-2 text-white/80 hover:text-white text-lg font-light" 
            onClick={(e) => handleNavClick(e, 'about')}
          >
            About
          </a>
          <a 
            href="#games" 
            className="py-2 text-white/80 hover:text-white text-lg font-light" 
            onClick={(e) => handleNavClick(e, 'games')}
          >
            Games
          </a>
          <a 
            href="#careers" 
            className="py-2 text-white/80 hover:text-white text-lg font-light" 
            onClick={(e) => handleNavClick(e, 'careers')}
          >
            Careers
          </a>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
