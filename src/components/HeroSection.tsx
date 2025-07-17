
import React from 'react';
import CharacterCards from './CharacterCards';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-24 md:pt-28">
      {/* Text content */}
      <div className="text-center px-4 pt-12 md:pt-16 pb-2 md:pb-0 md:relative md:z-10 md:mb-[-2rem]">
        <h1 className="text-2xl md:text-[5rem] font-extrabold text-foreground mt-8 mb-[1.8rem] tracking-tight">
          Moments of <span style={{ 
            background: 'linear-gradient(to top right, #ffb728, #fff032)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            filter: 'drop-shadow(0 0.1em 0.02em #c0461f)'
          }}>Joy</span>
        </h1>
        <p className="text-[1.2rem] text-foreground font-light max-w-3xl mx-auto leading-relaxed px-6 py-4 mb-20">
          We make fun games that stay with you. We believe joy is found in small details — the timing of a tap, the surprise in a level, the charm in a character.
        </p>
      </div>
      
      {/* Character Cards */}
      <div className="w-full px-4 mt-8">
        <CharacterCards />
      </div>
    </section>
  );
};

export default HeroSection;
