
import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  return (
    <footer className="bg-gray-900 text-white mt-2.5">
      <div className="container mx-auto px-4 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="mb-5">
              <img 
                src="/lovable-uploads/8693fdf1-7771-482f-8510-05893d8802a2.png" 
                alt="BIG Logo" 
                className="h-16" 
              />
            </div>
            <div className="text-xl md:text-2xl text-gray-300 border-l-4 border-primary/60 pl-4 py-2 font-arial">
              <div dangerouslySetInnerHTML={{ __html: quote }} />
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-5">Company</h4>
            <ul className="space-y-3">
              <li>
                <a href="#about" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  About Us
                </a>
              </li>
              <li>
                <a href="#games" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Games
                </a>
              </li>
              <li>
                <a href="#careers" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Careers
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <ChevronRight className="h-4 w-4 mr-1" />
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} B.I.G - Berry Interactive Games LTD. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
