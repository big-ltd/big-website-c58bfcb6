
import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gray-900 pt-24 md:pt-28">
      {/* Full image without cropping */}
      <div className="w-full">
        <img 
          src="/lovable-uploads/96c56aac-9191-4f5a-81e4-6475b88aca00.png" 
          alt="Match Story Game" 
          className="w-full h-auto"
        />
      </div>
    </section>
  );
};

export default HeroSection;
