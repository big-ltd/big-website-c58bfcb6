
import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import Cookies from 'js-cookie';
import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import { Button } from "@/components/ui/button";

const COOKIE_NAME = 'investor_authenticated';
const STORAGE_BUCKET = "investor_docs";
const SLIDES_PREFIX = "slides/";

const Invest = () => {
  const [searchParams] = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [slidesUrls, setSlidesUrls] = useState<string[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const slideContainerRef = React.useRef<HTMLDivElement>(null);
  // Add a timestamp to force cache refresh when needed
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    const checkAuthorization = async () => {
      // Check if already authorized via cookie
      const cookie = Cookies.get(COOKIE_NAME);
      if (cookie) {
        setIsAuthorized(true);
        await fetchSlides();
        setLoading(false);
        return;
      }

      // Check hash code from URL
      const hash = searchParams.get('hash');
      if (!hash) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        // Query the database to check if hash exists and is not redeemed
        const { data, error } = await supabase
          .from('investor_hash_codes')
          .select('*')
          .eq('hash_code', hash)
          .eq('redeemed', false)
          .single();

        if (error || !data) {
          console.error('Error checking hash code:', error);
          setIsAuthorized(false);
          toast({
            title: "Access Denied",
            description: "Invalid or expired access code.",
            variant: "destructive",
          });
        } else {
          // Set cookie for future access
          Cookies.set(COOKIE_NAME, 'true', { expires: 365 }); // 1 year expiry

          // Mark hash as redeemed
          await supabase
            .from('investor_hash_codes')
            .update({ redeemed: true })
            .eq('hash_code', hash);

          await fetchSlides();
          setIsAuthorized(true);
          toast({
            title: "Access Granted",
            description: `Welcome, ${data.investor_name}`,
          });
        }
      } catch (err) {
        console.error('Error:', err);
        setIsAuthorized(false);
      }

      setLoading(false);
    };

    checkAuthorization();
  }, [searchParams, toast]);

  const fetchSlides = async () => {
    try {
      // Update the cache timestamp to force new data loading
      setCacheTimestamp(Date.now());
      
      // List all files in the slides directory
      const { data, error } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .list(SLIDES_PREFIX, {
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Filter for only jpg/jpeg/png files
        const imageFiles = data.filter(file => 
          file.name.toLowerCase().endsWith('.jpg') || 
          file.name.toLowerCase().endsWith('.jpeg') || 
          file.name.toLowerCase().endsWith('.png')
        );

        // Sort files by name (assuming they are named with numbers like 01.jpg, 02.jpg, etc.)
        imageFiles.sort((a, b) => {
          // Extract numbers from filenames for natural sorting
          const nameA = a.name;
          const nameB = b.name;
          return nameA.localeCompare(nameB, undefined, { numeric: true });
        });

        // Get public URLs for all slides and add cache-busting parameter
        const urls = imageFiles.map(file => {
          const { data } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(SLIDES_PREFIX + file.name);
          
          // Add a cache-busting parameter to the URL
          return `${data.publicUrl}?t=${cacheTimestamp}`;
        });

        setSlidesUrls(urls);
      } else {
        // No slides found, try to use static files
        try {
          // Check for static slides in public folder
          const staticUrls = [];
          let i = 1;
          const maxStaticSlides = 20; // Limit to checking 20 static slides

          while (i <= maxStaticSlides) {
            const fileName = `0${i}`.slice(-2) + '.jpg'; // Format as 01.jpg, 02.jpg, etc.
            const url = `/lovable-uploads/slides/${fileName}?t=${cacheTimestamp}`;
            
            // Try to check if file exists (this is approximate)
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
              staticUrls.push(url);
              i++;
            } else {
              break; // Stop when we don't find any more slides
            }
          }

          if (staticUrls.length > 0) {
            setSlidesUrls(staticUrls);
          } else {
            toast({
              title: "No Slides Found",
              description: "No presentation slides are available.",
              variant: "destructive",
            });
          }
        } catch (staticError) {
          console.error('Error loading static slides:', staticError);
          toast({
            title: "Error",
            description: "Failed to load presentation slides.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast({
        title: "Error",
        description: "Failed to load presentation slides.",
        variant: "destructive",
      });
    }
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < slidesUrls.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const toggleFullscreen = () => {
    if (!slideContainerRef.current) return;
    
    if (!isFullscreen) {
      if (slideContainerRef.current.requestFullscreen) {
        slideContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPreviousSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Handle fullscreen change events from browser
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [currentSlideIndex, slidesUrls.length]);

  // Function to refresh slides on demand
  const refreshSlides = () => {
    setCacheTimestamp(Date.now());
    fetchSlides();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-white text-xl font-semibold">Verifying access...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 bg-gradient-primary flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Investor Information</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshSlides}
                className="text-white hover:bg-gray-700"
              >
                Refresh Slides
              </Button>
              <Button
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:bg-gray-700"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </Button>
            </div>
          </div>
          
          <div 
            ref={slideContainerRef}
            className="relative w-full h-[calc(100vh-200px)] bg-black flex flex-col items-center justify-center"
          >
            {slidesUrls.length > 0 ? (
              <>
                <img 
                  src={slidesUrls[currentSlideIndex]} 
                  alt={`Slide ${currentSlideIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
                
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4">
                  <Button
                    onClick={goToPreviousSlide}
                    disabled={currentSlideIndex === 0}
                    className="rounded-full p-2 h-10 w-10"
                    variant="secondary"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  <span className="text-white bg-gray-800/70 px-3 py-1 rounded-md text-sm">
                    {currentSlideIndex + 1} / {slidesUrls.length}
                  </span>
                  
                  <Button
                    onClick={goToNextSlide}
                    disabled={currentSlideIndex === slidesUrls.length - 1}
                    className="rounded-full p-2 h-10 w-10"
                    variant="secondary"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-white">No investor slides available. Please contact the administrator.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invest;
