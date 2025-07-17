
import React from 'react';
import CharacterCards from './CharacterCards';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-24 md:pt-28">
      {/* Text content */}
      <div className="text-center px-4 pt-12 md:pt-16 pb-2 md:pb-0 md:relative md:z-10 md:mb-[-2rem]">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 tracking-tight">
          MOMENTS OF JOY
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-6 py-4">
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
