
import React from 'react';

const GamesSection = () => {
  return (
    <section id="games" className="bg-white dark:bg-gray-900 pt-0 pb-4">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block mb-3 px-4 py-1 bg-primary/10 rounded-full">
            <span className="text-primary font-medium">Our Games</span>
          </div>
        </div>
        
        <div className="game-content">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <div className="p-4">
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
                  src="/lovable-uploads/f826845e-cfba-4e75-b742-8f4d5ae927ed.png" 
                  alt="Match Story Gameplay" 
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
