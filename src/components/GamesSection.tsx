
import React from 'react';
import { Button } from '@/components/ui/button';

const GamesSection = () => {
  return (
    <section id="games" className="section bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <h2 className="title-text mb-4">Our Games</h2>
          <p className="subtitle-text max-w-2xl mx-auto">
            Explore our collection of engaging and immersive games designed for all ages and preferences.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Game Card 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <img 
              src="/lovable-uploads/8ae4f57d-3b33-4f87-add0-e9df9b145635.png" 
              alt="Match Story" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Match Story</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                A captivating match-3 game with an engaging storyline.
              </p>
              <Button variant="outline" className="w-full">Learn More</Button>
            </div>
          </div>
          
          {/* Game Card 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <img 
              src="/lovable-uploads/bce95719-3c2d-41ff-a1ea-2d87c8a07993.png" 
              alt="Adventure Quest" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Adventure Quest</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Embark on an epic journey through magical realms.
              </p>
              <Button variant="outline" className="w-full">Learn More</Button>
            </div>
          </div>
          
          {/* Game Card 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
            <img 
              src="/lovable-uploads/5eb41409-f9b8-4c4e-aa67-023981c375c2.png" 
              alt="Strategy Masters" 
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">Strategy Masters</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Test your tactical skills in this challenging strategy game.
              </p>
              <Button variant="outline" className="w-full">Learn More</Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GamesSection;
