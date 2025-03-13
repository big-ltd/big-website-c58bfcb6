
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const gameProjects = [
  {
    title: "Match Story",
    description: "A captivating match-3 adventure with engaging storylines and immersive gameplay.",
    image: "/lovable-uploads/63308921-38b2-4e2c-8b5e-2fefa4ca6fc7.png",
    stats: [
      { value: '4.8', label: 'Rating' },
      { value: '1M+', label: 'Downloads' },
      { value: '2022', label: 'Release' }
    ]
  },
  {
    title: "Epic Quest",
    description: "An immersive RPG adventure set in a magical world with challenging quests and character customization.",
    image: "https://images.unsplash.com/photo-1580234811497-9df7fd2f357e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    stats: [
      { value: '4.6', label: 'Rating' },
      { value: '500K+', label: 'Downloads' },
      { value: '2023', label: 'Release' }
    ]
  }
];

const AboutSection = () => {
  return (
    <section id="games" className="section bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-1 bg-primary/10 rounded-full">
            <span className="text-primary font-medium">Our Games</span>
          </div>
          <h2 className="title-text mb-6">
            Crafting <span className="gradient-text">Memorable</span> Gaming Experiences
          </h2>
          <p className="subtitle-text max-w-2xl mx-auto">
            We create games that captivate players and build lasting communities. 
            Our titles combine engaging gameplay with rich storytelling to deliver 
            unforgettable experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {gameProjects.map((game, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative">
                <img 
                  src={game.image} 
                  alt={game.title} 
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-bold text-white">{game.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-6">{game.description}</p>
                <div className="flex justify-between items-center mb-6">
                  {game.stats.map((stat, statIndex) => (
                    <div key={statIndex} className="text-center">
                      <div className="text-xl font-bold gradient-text">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
