
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
                  src="/lovable-uploads/19b593e8-7f17-40ea-9749-27b79f8b8bd1.png" 
                  alt="Match Tiles" 
                  className="mr-4 h-24 w-24" 
                />
                Match Story
              </h3>
              <p className="text-gray-700 mb-6">
                Match Story is an addictive yet relaxing puzzle game. Tap-to-match tiles to progress through chapters and unveil secrets.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <a 
                  href="https://apps.apple.com/cy/app/match-story/id6499223049" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src="/lovable-uploads/039f9dfa-68ee-409b-b3fc-46db2bb54596.png" 
                    alt="Download on the App Store" 
                    className="h-12" 
                  />
                </a>
                <a 
                  href="https://play.google.com/store/apps/details?id=com.big.MatchStory" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src="/lovable-uploads/bce95719-3c2d-41ff-a1ea-2d87c8a07993.png" 
                    alt="Get it on Google Play" 
                    className="h-12" 
                  />
                </a>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 order-1 md:order-2">
            <div className="relative rounded-xl overflow-hidden shadow-md max-w-[280px] mx-auto">
              <img 
                src="/lovable-uploads/d9132b9d-a28d-475a-8a9c-ecd09e2d95b6.png" 
                alt="Match Story" 
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
