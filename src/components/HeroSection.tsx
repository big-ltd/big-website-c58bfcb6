
import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gray-900">
      {/* Full-height image container without cropping */}
      <div className="w-full h-[70vh]">
        <img 
          src="/lovable-uploads/8ae4f57d-3b33-4f87-add0-e9df9b145635.png" 
          alt="Match Story Game" 
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
};

export default HeroSection;
