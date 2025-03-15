
import React from 'react';
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gray-900">
      {/* Background gradient elements */}
      <div className="absolute top-0 left-[10%] w-72 h-72 bg-[#5E3BA5]/20 rounded-full filter blur-3xl opacity-70 animate-float"></div>
      <div className="absolute bottom-10 right-[5%] w-80 h-80 bg-[#361E75]/20 rounded-full filter blur-3xl opacity-70 animate-float" style={{ animationDelay: '1s' }}></div>
      
      {/* Hero content with controlled height */}
      <div className="relative h-[70vh] flex items-center justify-center">
        <img 
          src="/lovable-uploads/8ae4f57d-3b33-4f87-add0-e9df9b145635.png" 
          alt="Match Story Game" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '50% 0%' }} // Position from the top
        />
        
        {/* Optional overlay gradient for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/70"></div>
        
        {/* Optional: Add content on top of the image */}
        <div className="relative z-10 container mx-auto px-4 text-center mt-32">
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
