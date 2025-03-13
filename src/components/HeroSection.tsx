
import React from 'react';

const HeroSection = () => {
  return (
    <section id="about" className="relative pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gray-900">
      {/* Background gradient elements */}
      <div className="absolute top-0 left-[10%] w-72 h-72 bg-[#5E3BA5]/20 rounded-full filter blur-3xl opacity-70 animate-float"></div>
      <div className="absolute bottom-10 right-[5%] w-80 h-80 bg-[#361E75]/20 rounded-full filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-1 bg-primary/20 rounded-full">
            <span className="text-primary-foreground text-lg">About</span>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2 animate-fade-in">
            <p className="subtitle-text mb-8 max-w-xl text-gray-300">
              Big is a mobile game developer and publisher based in Cyprus. We are all about creating games that players love and that inspire fandom. We believe that the freedom to pursue our passions—while staying attuned to what players want—makes game development truly rewarding.
            </p>
          </div>
          <div className="w-full lg:w-1/2 animate-fade-in-slow">
            <div className="bg-gradient-primary p-1 rounded-2xl shadow-xl">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <img 
                  src="/lovable-uploads/8ae4f57d-3b33-4f87-add0-e9df9b145635.png" 
                  alt="Match Story Game" 
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
