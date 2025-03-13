
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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
    )}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center space-x-2">
            <span className="font-bold text-xl gradient-text">BIG LTD</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-foreground/80 hover:text-primary transition-colors">Services</a>
            <a href="#features" className="text-foreground/80 hover:text-primary transition-colors">Features</a>
            <a href="#about" className="text-foreground/80 hover:text-primary transition-colors">About</a>
            <a href="#team" className="text-foreground/80 hover:text-primary transition-colors">Team</a>
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">Contact Us</Button>
          </nav>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-foreground focus:outline-none"
            onClick={toggleMenu}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "absolute top-full left-0 right-0 bg-white shadow-md md:hidden transition-all duration-300 overflow-hidden",
        isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          <a href="#services" className="py-2 text-foreground/80 hover:text-primary" onClick={toggleMenu}>Services</a>
          <a href="#features" className="py-2 text-foreground/80 hover:text-primary" onClick={toggleMenu}>Features</a>
          <a href="#about" className="py-2 text-foreground/80 hover:text-primary" onClick={toggleMenu}>About</a>
          <a href="#team" className="py-2 text-foreground/80 hover:text-primary" onClick={toggleMenu}>Team</a>
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">Contact Us</Button>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
