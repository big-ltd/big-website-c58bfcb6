
import React from 'react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

const AboutSection = () => {
  return (
    <section id="games" className="section bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-block mb-4 px-4 py-1 bg-primary/10 rounded-full">
            <span className="text-primary font-medium">Our Games</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 order-2 md:order-1">
            <div className="p-6">
              <h3 className="text-2xl font-bold mb-4 flex items-center">
                <img 
                  src="/lovable-uploads/8693fdf1-7771-482f-8510-05893d8802a2.png" 
                  alt="Match Tiles" 
                  className="mr-2 h-8 w-8"
                />
                Match Story
              </h3>
              <p className="text-gray-700 mb-6">
                Match Story is an addictive yet relaxing puzzle game. Tap-to-match tiles to progress through chapters and unveil secrets.
              </p>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 order-1 md:order-2">
            <div className="relative rounded-xl overflow-hidden shadow-md max-w-md mx-auto">
              <AspectRatio ratio={9/16} className="bg-muted">
                <img 
                  src="/lovable-uploads/d9132b9d-a28d-475a-8a9c-ecd09e2d95b6.png" 
                  alt="Match Story" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              </AspectRatio>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
