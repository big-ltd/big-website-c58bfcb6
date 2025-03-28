
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
import { ChevronsLeft, ChevronsRight, Maximize, Minimize } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

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

// Component to display the hash watermark
function HashWatermark({ hash }) {
  if (!hash) return null;
  
  return (
    <div className="absolute top-4 left-0 right-0 flex justify-center z-10 pointer-events-none">
      <div className="text-white opacity-50 text-[0.4rem]">
        {hash}
      </div>
    </div>
  );
}

export default function Deck() {
  const { state, goToNextSlide, goToPrevSlide, goToSlide } = useDeckState();
  const isMobile = useIsMobile();
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const deckContainerRef = useRef<HTMLDivElement>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Apply body class for black background
  useEffect(() => {
    document.body.classList.add('deck-page');
    
    return () => {
      document.body.classList.remove('deck-page');
    };
  }, []);
  
  // Verify hash code access
  useEffect(() => {
    const verifyAccess = async () => {
      // Parse the hash from the URL
      const params = new URLSearchParams(location.search);
      const hash = params.get('hash');
      
      if (!hash) {
        setIsAuthorized(false);
        return;
      }
      
      setCurrentHash(hash);
      
      try {
        // Check if user has a cookie for this hash already
        const accessCookieName = `deck_access_${hash}`;
        const hasAccessCookie = document.cookie.includes(accessCookieName);
        
        // Verify the hash with the server
        const response = await fetch(`/api/verify-hash.php?hash=${hash}`);
        const data = await response.json();
        
        if (data.valid) {
          setIsAuthorized(true);
          
          // If this is a new visit (no cookie), record the view
          if (!hasAccessCookie) {
            // Record the viewing device
            await fetch('/api/record-view.php', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                hash,
                userAgent: navigator.userAgent,
              }),
            });
            
            // Set a cookie to mark this device as having accessed this hash
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 months expiry
            document.cookie = `${accessCookieName}=true; expires=${expiryDate.toUTCString()}; path=/`;
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error verifying hash:', error);
        setIsAuthorized(false);
      }
    };
    
    verifyAccess();
  }, [location.search]);
  
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
  
  // Touch gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMobile) return; // Disable touch gestures on mobile since we're showing all slides
    
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isMobile || !touchStart) return; // Disable touch gestures on mobile
    
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
  
  // Show loading state
  if (isAuthorized === null) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center p-4">
          <p>Verifying access...</p>
        </div>
      </div>
    );
  }
  
  // Show unauthorized message
  if (isAuthorized === false) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center p-4">
          <h2 className="text-xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">You do not have permission to view this deck.</p>
          <Button 
            onClick={() => navigate('/')}
            className="bg-white text-black hover:bg-gray-200"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }
  
  // Current slide to display
  const currentSlide = state.slides[state.currentSlideIndex] || null;
  
  // Mobile view - show all slides stacked vertically
  if (isMobile) {
    return (
      <div className="w-full min-h-screen bg-black overflow-y-auto relative">
        {/* Hash watermark at the top of the page */}
        <HashWatermark hash={currentHash} />
        
        <div className="pb-12">
          {state.slides.length === 0 ? (
            <div className="text-white text-center p-4">
              <p>No slides available.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-[3px] py-6">
              {state.slides.map((slide, index) => (
                <div key={slide.id} className="w-full max-w-[90vw]">
                  <div className="relative">
                    <img 
                      src={slide.imageUrl} 
                      alt={`Slide ${slide.order + 1}`}
                      className="w-full object-contain"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Desktop view with sidebar and fullscreen handling
  return (
    <SidebarProvider>
      <FullscreenAwareSidebar isFullscreen={isFullscreen}>
        <div className="flex w-full min-h-screen" ref={deckContainerRef}>
          <Sidebar>
            <SidebarContent className="bg-black">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4 text-white">Slides</h2>
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
            
            {/* Hash watermark in the desktop view */}
            <HashWatermark hash={currentHash} />
            
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
  
  // Close sidebar when entering fullscreen, open when exiting
  useEffect(() => {
    if (isFullscreen) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [isFullscreen, setOpen]);
  
  return <>{children}</>;
}
