
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { scrollToSection } from '@/utils/scrollUtils';

const Footer = () => {

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
              src="/meta/big_goldenpaw_512.png" 
              alt="big Logo" 
              className="h-10" 
            />
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
