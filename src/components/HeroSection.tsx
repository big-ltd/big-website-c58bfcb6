
import React from 'react';

const HeroSection = () => {
  return (
    <section id="about" className="relative pt-20 pb-10 md:pt-32 md:pb-16 overflow-hidden bg-gray-900">
      {/* Background gradient elements */}
      <div className="absolute top-0 left-[10%] w-72 h-72 bg-[#5E3BA5]/20 rounded-full filter blur-3xl opacity-70 animate-float"></div>
      <div className="absolute bottom-10 right-[5%] w-80 h-80 bg-[#361E75]/20 rounded-full filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '1s' }}></div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <div className="inline-block mb-3 px-4 py-1 bg-primary/20 rounded-full">
            <span className="text-primary-foreground text-lg">About</span>
          </div>
        </div>
        
        {/* Image first on mobile and desktop */}
        <div className="w-full mb-8 animate-fade-in-slow">
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
        
        {/* Text content below image */}
        <div className="w-full max-w-3xl mx-auto animate-fade-in">
          <p className="subtitle-text mb-6 text-gray-300 text-center">
            Big is a mobile game developer and publisher based in Cyprus. We are all about creating games that players love and that inspire fandom. We believe that the freedom to pursue our passions—while staying attuned to what players want—makes game development truly rewarding.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
