
import React from 'react';

const GamesSection = () => {
  return (
    <section id="games" className="bg-gray-50 dark:bg-gray-900 pt-[-8px] pb-0">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-2">
          <div className="inline-block mb-3 px-4 py-1 bg-primary/10 rounded-full">
            <span className="text-primary font-medium">Our Games</span>
          </div>
        </div>
        
        <div className="game-content max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2">
            <div className="w-full md:w-1/2 order-2 md:order-1 mt-8 md:mt-0">
              <div className="md:pr-0">
                <h3 className="text-2xl font-bold mb-4 flex items-center">
                  <img 
                    src="/lovable-uploads/998529a0-5470-4fba-afbc-918f75b9961e.png" 
                    alt="Match Tiles" 
                    className="mr-4 h-24 w-24" 
                  />
                  Match Story
                </h3>
                <p className="text-gray-700 mb-6 text-xl md:text-2xl">
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
            
            <div className="w-full md:w-1/2 order-1 md:order-2 flex justify-center mb-4 md:mb-0">
              <div className="relative rounded-xl overflow-hidden max-w-[300px]">
                <img 
                  src="/lovable-uploads/1c616fde-d3fb-4821-b4e1-121e579c982a.png" 
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
