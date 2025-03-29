
import React, { useEffect, useState } from 'react';
import { useDeckState } from '@/hooks/useDeckState';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarTrigger,
  SidebarInset
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Deck() {
  const { state, goToNextSlide, goToPrevSlide, goToSlide } = useDeckState();
  const isMobile = useIsMobile();
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPrevSlide();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide]);
  
  // Touch gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Determine if it was a horizontal or vertical swipe
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 50) {
        goToPrevSlide();
      } else if (deltaX < -50) {
        goToNextSlide();
      }
    } else {
      // Vertical swipe
      if (deltaY > 50) {
        goToPrevSlide();
      } else if (deltaY < -50) {
        goToNextSlide();
      }
    }
    
    setTouchStart(null);
  };
  
  // Current slide to display
  const currentSlide = state.slides[state.currentSlideIndex] || null;
  
  // Mobile view
  if (isMobile) {
    return (
      <div 
        className="w-full h-screen bg-black flex items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {state.slides.length === 0 ? (
          <div className="text-white text-center p-4">
            <p>No slides available.</p>
          </div>
        ) : (
          <>
            {currentSlide && (
              <img 
                src={currentSlide.imageUrl} 
                alt={`Slide ${currentSlide.order + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}
          </>
        )}
      </div>
    );
  }
  
  // Desktop view with sidebar
  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        <Sidebar>
          <SidebarContent>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-4">Slides</h2>
              <ScrollArea className="h-[calc(100vh-100px)]">
                <div className="space-y-2 pr-2">
                  {state.slides.map((slide, index) => (
                    <Card 
                      key={slide.id}
                      className={`
                        overflow-hidden cursor-pointer transition-all
                        ${index === state.currentSlideIndex ? 'ring-2 ring-primary' : ''}
                      `}
                      onClick={() => goToSlide(index)}
                    >
                      <div className="relative aspect-video">
                        <img
                          src={slide.imageUrl}
                          alt={`Slide ${slide.order + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                          {slide.order + 1}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="bg-black relative">
          <div className="absolute top-2 left-2 z-10">
            <SidebarTrigger />
          </div>
          
          <div className="flex items-center justify-center h-full w-full relative">
            {state.slides.length === 0 ? (
              <div className="text-white text-center p-4">
                <p>No slides available.</p>
              </div>
            ) : (
              <>
                {currentSlide && (
                  <img 
                    src={currentSlide.imageUrl} 
                    alt={`Slide ${currentSlide.order + 1}`}
                    className="max-w-full max-h-[90vh] object-contain"
                  />
                )}
                
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={goToPrevSlide}
                    disabled={state.currentSlideIndex === 0}
                    className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                  >
                    <ChevronsLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <div className="text-white bg-black/50 px-3 py-2 rounded-md">
                    {state.currentSlideIndex + 1} / {state.slides.length}
                  </div>
                  <Button
                    variant="outline"
                    onClick={goToNextSlide}
                    disabled={state.currentSlideIndex === state.slides.length - 1}
                    className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                  >
                    Next <ChevronsRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
