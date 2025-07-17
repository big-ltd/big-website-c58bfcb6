
import React from 'react';

const GamesSection = () => {
  return (
    <section id="games" className="pt-[-8px] pb-0" style={{backgroundColor: '#ffffff'}}>
      <div className="container px-4 mx-auto">
        <div className="game-content max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-2">
            <div className="w-full md:w-1/2 order-1 md:order-1 mt-8 md:mt-0">
              <div className="md:pr-0">
                <div className="flex flex-col items-center mb-4">
                  <img 
                    src="/lovable-uploads/7edd867d-ed4d-4052-8695-f6bf4f4e8c9d.png" 
                    alt="Match Story Game Logo" 
                    className="h-24 w-auto md:h-32 md:w-auto lg:h-40 lg:w-auto mb-3" 
                  />
                </div>
                <p className="text-[1.2rem] text-foreground font-light max-w-3xl mx-auto leading-relaxed px-6 py-4 mb-6 text-center">
                  Miss Victoria needs your help to match tiles and solve dramas!
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
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
            
            <div className="w-full md:w-1/2 order-2 md:order-2 flex justify-center mb-4 md:mb-0">
              <div className="relative rounded-[2rem] overflow-hidden max-w-[300px]">
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
