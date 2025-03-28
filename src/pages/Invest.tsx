import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import Cookies from 'js-cookie';
import { ChevronLeft, ChevronRight, Maximize, Minimize } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';

const COOKIE_NAME = 'investor_authenticated';
const STORAGE_BUCKET = "investor_docs";
const SLIDES_FOLDER = "slides";

// Interface that matches the database schema
interface DbSlideRecord {
  id: string;
  filename: string; // Note: lowercase 'n' to match DB schema
  order: number;
  created_at: string;
}

const Invest = () => {
  const [searchParams] = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();
  const slideContainerRef = React.useRef<HTMLDivElement>(null);

  // Fetch slides in correct order from database
  const { data: slideUrls = [] } = useQuery({
    queryKey: ['investor-slides'],
    queryFn: async () => {
      try {
        // Get slide order from database
        const { data: slideOrderData, error: orderError } = await supabase
          .from('slide_order')
          .select('*')
          .order('order', { ascending: true });

        if (orderError) {
          throw orderError;
        }

        if (!slideOrderData || slideOrderData.length === 0) {
          return [];
        }

        // Map database entries to public URLs
        return (slideOrderData as DbSlideRecord[]).map((slide) => {
          const { data } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(`${SLIDES_FOLDER}/${slide.filename}`);
          return data.publicUrl;
        });
      } catch (error) {
        console.error('Error fetching slides:', error);
        return [];
      }
    },
    enabled: isAuthorized === true,
  });

  useEffect(() => {
    const checkAuthorization = async () => {
      // Check if already authorized via cookie
      const cookie = Cookies.get(COOKIE_NAME);
      if (cookie) {
        setIsAuthorized(true);
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

  const goToNextSlide = () => {
    if (currentSlideIndex < slideUrls.length - 1) {
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
  }, [currentSlideIndex, slideUrls.length]);

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
            {slideUrls.length > 0 ? (
              <>
                <img 
                  src={slideUrls[currentSlideIndex]} 
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
                    {currentSlideIndex + 1} / {slideUrls.length}
                  </span>
                  
                  <Button
                    onClick={goToNextSlide}
                    disabled={currentSlideIndex === slideUrls.length - 1}
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
