
import React, { useEffect, useState, useRef } from 'react';
import { useDeckState } from '@/hooks/useDeckState';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarTrigger,
  SidebarInset,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight, Maximize, Minimize, ZoomIn, ZoomOut } from 'lucide-react';

// Helper to detect iOS
function isIOS() {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform)
  // iPad on iOS 13 detection
  || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
}

// Component for fullscreen button that only shows on non-iOS devices
function FullscreenButton({ onClick, isFullscreen }) {
  // Don't render on iOS
  if (isIOS()) {
    return null;
  }
  
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onClick}
      className="bg-black/50 text-white border-white/20 hover:bg-black/70"
    >
      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
    </Button>
  );
}

export default function Deck() {
  const { state, goToNextSlide, goToPrevSlide, goToSlide } = useDeckState();
  const isMobile = useIsMobile();
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);
  const [zoomLevel, setZoomLevel] = useState(1);
  const deckContainerRef = useRef<HTMLDivElement>(null);
  
  // Handle screen orientation changes
  useEffect(() => {
    const handleResize = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPrevSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide, isFullscreen]);
  
  // Fullscreen change event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);
  
  // Touch gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || isPortrait) return;
    
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
  
  // Zoom controls
  const increaseZoom = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };
  
  const decreaseZoom = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };
  
  // Fullscreen toggle functions
  const enterFullscreen = () => {
    if (deckContainerRef.current) {
      if (deckContainerRef.current.requestFullscreen) {
        deckContainerRef.current.requestFullscreen();
      }
    }
  };
  
  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };
  
  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };
  
  // Current slide to display
  const currentSlide = state.slides[state.currentSlideIndex] || null;
  
  // Mobile view with portrait orientation - vertical view of all slides
  if (isMobile && isPortrait) {
    return (
      <div 
        ref={deckContainerRef}
        className="w-full min-h-screen bg-black flex flex-col items-center overflow-hidden relative"
      >
        <div className="sticky top-0 left-0 right-0 z-10 p-3 flex justify-between items-center bg-black/70 backdrop-blur-sm">
          <div className="text-white text-sm">
            {state.slides.length} Slides
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={decreaseZoom}
              className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={increaseZoom}
              className="bg-black/50 text-white border-white/20 hover:bg-black/70"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="w-full h-[calc(100vh-56px)]">
          <div className="flex flex-col items-center gap-6 p-4">
            {state.slides.length === 0 ? (
              <div className="text-white text-center p-4">
                <p>No slides available.</p>
              </div>
            ) : (
              state.slides.map((slide, index) => (
                <div key={slide.id} className="flex flex-col items-center w-full">
                  <div className="text-white mb-2 text-center">
                    Slide {index + 1} / {state.slides.length}
                  </div>
                  <div 
                    className="w-full bg-black border border-gray-800 rounded-lg overflow-hidden"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transformOrigin: 'top center',
                      marginBottom: `${(zoomLevel - 1) * 100}px` // Add extra margin based on zoom
                    }}
                  >
                    <img 
                      src={slide.imageUrl} 
                      alt={`Slide ${slide.order + 1}`}
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    );
  }
  
  // Mobile view with landscape orientation - regular slide by slide
  if (isMobile) {
    return (
      <div 
        ref={deckContainerRef}
        className="w-full h-screen bg-black flex flex-col items-center justify-center overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          <FullscreenButton isFullscreen={isFullscreen} onClick={toggleFullscreen} />
        </div>
        
        {state.slides.length === 0 ? (
          <div className="text-white text-center p-4">
            <p>No slides available.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 flex items-center justify-center w-full">
              {currentSlide && (
                <img 
                  src={currentSlide.imageUrl} 
                  alt={`Slide ${currentSlide.order + 1}`}
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
            
            <div className="p-4 w-full flex justify-center items-center gap-3">
              <Button
                variant="outline"
                onClick={goToPrevSlide}
                disabled={state.currentSlideIndex === 0}
                className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                size="sm"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-white bg-black/50 px-3 py-2 rounded-md">
                {state.currentSlideIndex + 1} / {state.slides.length}
              </div>
              
              <Button
                variant="outline"
                onClick={goToNextSlide}
                disabled={state.currentSlideIndex === state.slides.length - 1}
                className="bg-black/50 text-white border-white/20 hover:bg-black/70"
                size="sm"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    );
  }
  
  // Desktop view with sidebar and fullscreen handling
  return (
    <SidebarProvider>
      <FullscreenAwareSidebar isFullscreen={isFullscreen}>
        <div className="flex w-full min-h-screen" ref={deckContainerRef}>
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
            
            <div className="absolute top-2 right-2 z-10">
              <FullscreenButton isFullscreen={isFullscreen} onClick={toggleFullscreen} />
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
      </FullscreenAwareSidebar>
    </SidebarProvider>
  );
}

// Component to handle sidebar state based on fullscreen status
function FullscreenAwareSidebar({ children, isFullscreen }) {
  const { setOpen } = useSidebar();
  
  // Close sidebar when entering fullscreen
  useEffect(() => {
    if (isFullscreen) {
      setOpen(false);
    }
  }, [isFullscreen, setOpen]);
  
  return <>{children}</>;
}
