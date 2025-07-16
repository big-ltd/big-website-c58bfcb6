
import React from 'react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-24 md:pt-28">
      {/* Text content */}
      <div className="text-center px-4 pt-12 md:pt-16 pb-2 md:pb-0 md:relative md:z-10 md:mb-[-2rem]">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 tracking-tight">
          MOMENTS OF JOY
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed bg-gray-50/90 dark:bg-gray-900/90 px-6 py-4 rounded-lg">
          We make fun games that stay with you.
        </p>
      </div>
      
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
