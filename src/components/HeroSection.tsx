
import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gray-900 pt-24 md:pt-28">
      {/* Container with max height and anchored to top */}
      <div className="w-full relative" style={{ maxHeight: "calc(100vh - 160px)", overflow: "hidden" }}>
        <img 
          src="/lovable-uploads/19db2fe7-5a40-4bf2-9691-ab80f2dd9dcb.png" 
          alt="big - Mobile Games - Party Poster" 
          className="w-full h-auto object-cover object-top"
        />
        {/* Text overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight">
            Moments of joy
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl leading-relaxed">
            big is a mobile gaming company. Our mission is to deliver joy and inspire fandom.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
