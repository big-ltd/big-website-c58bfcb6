
import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gray-900">
      {/* Background gradient elements */}
      <div className="absolute top-0 left-[10%] w-72 h-72 bg-[#5E3BA5]/20 rounded-full filter blur-3xl opacity-70 animate-float"></div>
      <div className="absolute bottom-10 right-[5%] w-80 h-80 bg-[#361E75]/20 rounded-full filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '1s' }}></div>
      
      {/* Full width image without margins */}
      <div className="w-full animate-fade-in-slow">
        <img 
          src="/lovable-uploads/8ae4f57d-3b33-4f87-add0-e9df9b145635.png" 
          alt="Match Story Game" 
          className="w-full h-[80vh] object-cover object-bottom"
        />
      </div>
    </section>
  );
};

export default HeroSection;
