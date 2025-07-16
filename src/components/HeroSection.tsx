
import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gray-900 pt-24 md:pt-28">
      {/* Container with max height and anchored to top */}
      <div className="w-full" style={{ maxHeight: "calc(100vh - 160px)", overflow: "hidden" }}>
        <img 
          src="/lovable-uploads/19db2fe7-5a40-4bf2-9691-ab80f2dd9dcb.png" 
          alt="big - Mobile Games - Party Poster" 
          className="w-full h-auto object-cover object-top"
        />
      </div>
    </section>
  );
};

export default HeroSection;
