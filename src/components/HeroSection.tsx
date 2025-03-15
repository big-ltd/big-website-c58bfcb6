
import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gray-900">
      {/* Full image without cropping */}
      <div className="w-full">
        <img 
          src="/lovable-uploads/8ae4f57d-3b33-4f87-add0-e9df9b145635.png" 
          alt="Match Story Game" 
          className="w-full h-auto"
        />
      </div>
    </section>
  );
};

export default HeroSection;
