import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const characters = [
  {
    image: "/lovable-uploads/6d95e63c-7bd4-450d-9f28-4c36211d13f0.png",
    text: "Miss Victoria keeps the mansion alive with purpose."
  },
  {
    image: "/lovable-uploads/1cf629a9-3c05-4f81-8dc8-f7a11f4a64b0.png",
    text: "King Cedric now rules with heart, not just a crown."
  },
  {
    image: "/lovable-uploads/36251085-fce7-4d1e-8d9b-0f4e874255ca.png",
    text: "Baker Florence bakes with kindness—and enchanted yeast."
  },
  {
    image: "/lovable-uploads/dc715bbb-a793-4f51-9a14-8d8260e75867.png",
    text: "Innkeeper Jasper makes every guest feel right at home."
  },
  {
    image: "/lovable-uploads/175bc047-7ad8-4640-a900-ab15422ce2f6.png",
    text: "Fisher Fred lives for calm lakes, big fish, and tall tales."
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
            className="character-card flex-shrink-0 snap-start rounded-[20%] overflow-hidden"
            style={{ 
              backgroundColor: '#f4f9f5',
              width: 'min(300px, 80vw)',
              scrollSnapAlign: 'start'
            }}
          >
            {/* Character image */}
            <div className="relative bg-gray-100">
              <img 
                src={character.image} 
                alt={`Character ${index + 1}`}
                className="w-full object-contain"
              />
            </div>
            
            {/* Character text */}
            <div className="p-6">
              <p 
                className="text-base font-semibold text-gray-700 leading-relaxed text-center"
                dangerouslySetInnerHTML={{ 
                  __html: character.text
                    .replace(/Miss Victoria/g, '<span style="background: linear-gradient(to top right, #ffb728, #fff032); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0.08em 0 #c0461f);">Miss Victoria</span>')
                    .replace(/King Cedric/g, '<span style="background: linear-gradient(to top right, #ffb728, #fff032); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0.08em 0 #c0461f);">King Cedric</span>')
                    .replace(/Baker Florence/g, '<span style="background: linear-gradient(to top right, #ffb728, #fff032); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0.08em 0 #c0461f);">Baker Florence</span>')
                    .replace(/Innkeeper Jasper/g, '<span style="background: linear-gradient(to top right, #ffb728, #fff032); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0.08em 0 #c0461f);">Innkeeper Jasper</span>')
                    .replace(/Fisher Fred/g, '<span style="background: linear-gradient(to top right, #ffb728, #fff032); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0.08em 0 #c0461f);">Fisher Fred</span>')
                }}
              />
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