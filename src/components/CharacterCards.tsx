import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const characters = [
  {
    image: "/lovable-uploads/6d95e63c-7bd4-450d-9f28-4c36211d13f0.jpg",
    text: "Miss Victoria keeps the mansion alive with purpose."
  },
  {
    image: "/lovable-uploads/1cf629a9-3c05-4f81-8dc8-f7a11f4a64b0.jpg",
    text: "King Cedric now rules with heart, not just a crown."
  },
  {
    image: "/lovable-uploads/36251085-fce7-4d1e-8d9b-0f4e874255ca.jpg",
    text: "Baker Florence bakes with kindness—and enchanted yeast."
  },
  {
    image: "/lovable-uploads/dc715bbb-a793-4f51-9a14-8d8260e75867.jpg",
    text: "Innkeeper Jasper makes every guest feel right at home."
  },
  {
    image: "/lovable-uploads/175bc047-7ad8-4640-a900-ab15422ce2f6.jpg",
    text: "Fisher Fred lives for calm lakes, big fish, and tall tales."
  }
];

const CharacterCards = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [allCardsFit, setAllCardsFit] = useState(false);
  const isMobile = useIsMobile();

  const checkScrollability = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const checkIfAllCardsFit = () => {
    // Calculate if all 5 cards can fit: 5 cards × 300px + 4 gaps × 16px + padding
    const estimatedWidth = (5 * 300) + (4 * 16) + 100; // ~1564px
    setAllCardsFit(window.innerWidth >= estimatedWidth);
  };

  useEffect(() => {
    checkScrollability();
    checkIfAllCardsFit();
    
    const handleResize = () => {
      checkIfAllCardsFit();
      checkScrollability();
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollability);
    }
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', checkScrollability);
      }
      window.removeEventListener('resize', handleResize);
    };
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
    <div className="relative mb-16">
      {/* Scrollable container */}
      <div 
        ref={scrollRef}
        className={`flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 ${allCardsFit ? 'justify-center' : ''}`}
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {characters.map((character, index) => (
          <div 
            key={index}
            className="character-card flex-shrink-0 snap-start rounded-[2rem] overflow-hidden"
            style={{ 
              backgroundColor: '#f5f4f9',
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
              <p className="text-base font-normal leading-relaxed text-center" style={{ color: 'midnightblue' }}>
                {character.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows - hidden on mobile and when all cards fit */}
      {!isMobile && !allCardsFit && canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          onClick={scrollToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg border-gray-200"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      
      {!isMobile && !allCardsFit && canScrollRight && (
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