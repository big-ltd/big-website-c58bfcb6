import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { scrollToSection } from '@/utils/scrollUtils';

const Footer = () => {
  const [quote, setQuote] = useState<string>("");
  
  const quotes = [
    "\"Love is the one thing that transcends time and space.\" – <i>Interstellar</i>",
    "\"Every choice you have ever made has led you to this moment.\" – <i>The Matrix Reloaded</i>",
    "\"Your focus determines your reality.\" – <i>Star Wars: The Phantom Menace</i>",
    "\"The dream is real.\" – <i>Inception</i>",
    "\"All those moments will be lost in time, like tears in rain.\" – <i>Blade Runner</i>",
    "\"We are only here briefly, and in this moment, I want to allow myself joy.\" – <i>Her</i>",
    "\"For every shadow, no matter how deep, is threatened by morning light.\" – <i>The Fountain</i>"
  ];
  
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (id === 'about') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      scrollToSection(id);
    }
  };

  return (
    <footer className="bg-white text-foreground mt-2.5">
      <div className="container mx-auto px-4 pt-12 pb-6">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo */}
          <div>
            <img 
              src="/lovable-uploads/00c104f6-2d2f-40f3-bc7d-743108a5d33c.png" 
              alt="big Logo" 
              className="h-10" 
            />
          </div>
          
          {/* Quote */}
          <div className="text-xs text-foreground/80 py-2 font-arial max-w-2xl">
            <div dangerouslySetInnerHTML={{ __html: quote }} />
          </div>
          
          {/* Menu Links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            <a href="#about" className="text-foreground/60 hover:text-foreground transition-colors"
               onClick={(e) => handleNavClick(e, 'about')}>
              About
            </a>
            <a href="#games" className="text-foreground/60 hover:text-foreground transition-colors"
               onClick={(e) => handleNavClick(e, 'games')}>
              Games
            </a>
            <a href="#careers" className="text-foreground/60 hover:text-foreground transition-colors"
               onClick={(e) => handleNavClick(e, 'careers')}>
              Careers
            </a>
            <a href="mailto:contact@big.com.cy" className="text-foreground/60 hover:text-foreground transition-colors">
              Contact
            </a>
            <Link to="/privacy" className="text-foreground/60 hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-foreground/60 hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
          
          {/* Copyright */}
          <div>
            <p className="text-foreground/60 text-sm">
              &copy; 2025 big
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
