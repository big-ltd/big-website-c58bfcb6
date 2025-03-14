
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetPosition = element.offsetTop - 50;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
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
          <a href="#" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/8693fdf1-7771-482f-8510-05893d8802a2.png" 
              alt="BIG Logo" 
              className="h-12" 
            />
          </a>

          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#about" 
              className="text-white/80 hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('about');
              }}
            >
              About
            </a>
            <a 
              href="#games" 
              className="text-white/80 hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('games');
              }}
            >
              Games
            </a>
            <a 
              href="#careers" 
              className="text-white/80 hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('careers');
              }}
            >
              Careers
            </a>
            <a 
              href="#contact" 
              className="text-white/80 hover:text-white transition-colors"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
            >
              Contact
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
            className="py-2 text-white/80 hover:text-white" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('about');
            }}
          >
            About
          </a>
          <a 
            href="#games" 
            className="py-2 text-white/80 hover:text-white" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('games');
            }}
          >
            Games
          </a>
          <a 
            href="#careers" 
            className="py-2 text-white/80 hover:text-white" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('careers');
            }}
          >
            Careers
          </a>
          <a 
            href="#contact" 
            className="py-2 text-white/80 hover:text-white" 
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('contact');
            }}
          >
            Contact
          </a>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
