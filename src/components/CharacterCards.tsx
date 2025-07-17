import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const characters = [
  {
    image: "/lovable-uploads/82ea3905-771b-477e-89a5-6338946a114a.png",
    text: "From pampered heiress to heartful host, Miss Victoria now plans every party with purpose and care."
  },
  {
    image: "/lovable-uploads/cbf2477f-3299-4e95-a5c8-0817812ac8cf.png",
    text: "Once carefree and full of jests, King Cedric now rules with a heart shaped by the dreams of his people."
  },
  {
    image: "/lovable-uploads/8703a2e7-09c7-478a-9cc5-d05139fa6351.png",
    text: "Baker Florence bakes with magic and love, believing a warm loaf can spark hope and heal hearts."
  },
  {
    image: "/lovable-uploads/20c101b9-efea-404e-af76-683ab30d9054.png",
    text: "Fisher Fred, keeper of lake lore and legendary catches, lives for the big fish and the bigger stories."
  },
  {
    image: "/lovable-uploads/31aaeec6-71f5-49cb-995e-f4b144122306.png",
    text: "Jasper runs his inn like a second home—where every guest leaves full, warm, and with a tale to tell."
  }
];

const CharacterCards = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollability();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollability);
      return () => scrollContainer.removeEventListener('scroll', checkScrollability);
    }
  }, []);

  const scrollToNext = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.querySelector('.character-card')?.clientWidth || 0;
      const gap = 16; // gap-4 = 16px
      scrollRef.current.scrollBy({
        left: cardWidth + gap,
        behavior: 'smooth'
      });
    }
  };

  const scrollToPrevious = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.querySelector('.character-card')?.clientWidth || 0;
      const gap = 16; // gap-4 = 16px
      scrollRef.current.scrollBy({
        left: -(cardWidth + gap),
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative">
      {/* Scrollable container */}
      <div 
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {characters.map((character, index) => (
          <div 
            key={index}
            className="character-card flex-shrink-0 snap-start bg-white rounded-[20%] overflow-hidden"
            style={{ 
              width: 'min(300px, 80vw)',
              scrollSnapAlign: 'start'
            }}
          >
            {/* Character image */}
            <div className="relative bg-gray-100">
              <img 
                src={character.image} 
                alt={`Character ${index + 1}`}
                className="w-full h-64 object-cover"
                style={{ aspectRatio: '1/1' }}
              />
            </div>
            
            {/* Character text */}
            <div className="p-6">
              <p className="text-sm text-gray-700 leading-relaxed text-center">
                {character.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      {canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          onClick={scrollToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg border-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      
      {canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          onClick={scrollToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg border-gray-200"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}

      {/* Hide scrollbar styles */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CharacterCards;