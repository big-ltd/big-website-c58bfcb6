
import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gray-900">
      {/* Simple full-height image container */}
      <div className="w-full h-[70vh]">
        <img 
          src="/lovable-uploads/8ae4f57d-3b33-4f87-add0-e9df9b145635.png" 
          alt="Match Story Game" 
          className="w-full h-full object-cover"
          style={{ objectPosition: '50% 40%' }} // Position the image to show the character's head
        />
      </div>
    </section>
  );
};

export default HeroSection;
