
import React from 'react';

const GamesSection = () => {
  return (
    <section id="games" className="section bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block mb-3 px-4 py-1 bg-primary/10 rounded-full">
            <span className="text-primary font-medium">Our Games</span>
          </div>
        </div>
        
        {/* Game content will go here */}
        <div className="game-content">
          {/* Future game cards or descriptions will be placed here */}
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
