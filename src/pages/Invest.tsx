
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import Cookies from 'js-cookie';
import { ChevronUp, ChevronDown, Maximize, Minimize, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { getSlidesOrder, getPublicUrl } from '@/utils/browserSlideUtils';
import { SLIDES_FOLDER } from '@/types/slideTypes';

const COOKIE_NAME = 'investor_authenticated';

const Invest = () => {
  const [searchParams] = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [slidesUrls, setSlidesUrls] = useState<string[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [storageError, setStorageError] = useState(false);
  const { toast } = useToast();
  const slideContainerRef = React.useRef<HTMLDivElement>(null);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    const checkAuthorization = async () => {
      const cookie = Cookies.get(COOKIE_NAME);
      if (cookie) {
        setIsAuthorized(true);
        await fetchSlides();
        setLoading(false);
        return;
      }

      const hash = searchParams.get('hash');
      if (!hash) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      try {
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
          Cookies.set(COOKIE_NAME, 'true', { expires: 365 });
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

  const fetchSlides = useCallback(async () => {
    try {
      setCacheTimestamp(Date.now());
      setStorageError(false);
      
      // Get slides order from localStorage
      const slideOrder = await getSlidesOrder();
      
      if (slideOrder && slideOrder.length > 0) {
        // Generate direct URLs for each slide
        const urls = slideOrder.map(name => getPublicUrl(name, cacheTimestamp));
        setSlidesUrls(urls);
        console.log("Loaded slides from order:", urls);
      } else {
        console.log("No slides order found");
        setSlidesUrls([]);
        
        toast({
          title: "No Slides Found",
          description: "No presentation slides are available.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
      setStorageError(true);
      toast({
        title: "Error",
        description: "Failed to load presentation slides.",
        variant: "destructive",
      });
      setSlidesUrls([]);
    }
  }, [cacheTimestamp, toast]);

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
    <div className="min-h-screen bg-gray-900 flex flex-col w-full">
      <div className="container mx-auto px-0 py-0 flex-grow flex">
        {/* Sidebar */}
        <div className={`w-64 bg-gray-800 transition-all duration-300 ${isSidebarOpen ? 'mr-4' : 'w-0 overflow-hidden'}`}>
          <div className="p-4">
            <div className="p-2 bg-gradient-primary rounded-md mb-4">
              <h2 className="text-lg font-semibold text-white">Slides ({slidesUrls.length})</h2>
            </div>
            <div className="grid gap-2 mt-2 max-h-[calc(100vh-120px)] overflow-y-auto p-1">
              {slidesUrls.length > 0 ? (
                slidesUrls.map((url, index) => (
                  <div 
                    key={index}
                    className={`relative cursor-pointer transition-all duration-200 
                      ${currentSlideIndex === index ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'}`}
                    onClick={() => goToSlide(index)}
                  >
                    <img 
                      src={url} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-24 object-contain bg-black rounded-md" 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                    <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-2 py-1 rounded-tl-md">
                      {index + 1}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center p-4">
                  No slides available
                </div>
              )}
            </div>
            
            {storageError && (
              <div className="bg-red-900/30 text-red-200 p-3 rounded flex items-start gap-2 mt-4">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Storage Error</p>
                  <p className="text-sm">There was an issue accessing the slides. Please try refreshing.</p>
                </div>
              </div>
            )}
            
            <div className="mt-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={refreshSlides}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Slides
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 bg-gradient-primary flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Investor Information</h1>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-white hover:bg-gray-700"
              >
                {isSidebarOpen ? "Hide Thumbnails" : "Show Thumbnails"}
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
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                    toast({
                      title: "Image Error",
                      description: `Failed to load slide ${currentSlideIndex + 1}. Make sure the image exists in the /public/slides/ folder.`,
                      variant: "destructive",
                    });
                  }}
                />
                
                <div className="absolute bottom-4 right-4 flex flex-col justify-center items-center gap-4 bg-gray-800/70 p-2 rounded-md">
                  <Button
                    onClick={goToPreviousSlide}
                    disabled={currentSlideIndex === 0}
                    className="rounded-full p-2 h-10 w-10"
                    variant="secondary"
                  >
                    <ChevronUp className="w-5 h-5" />
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
                    <ChevronDown className="w-5 h-5" />
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

  function goToNextSlide() {
    if (currentSlideIndex < slidesUrls.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  }

  function goToPreviousSlide() {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  }

  function goToSlide(index: number) {
    if (index >= 0 && index < slidesUrls.length) {
      setCurrentSlideIndex(index);
    }
  }

  function toggleFullscreen() {
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
  }

  function refreshSlides() {
    setCacheTimestamp(Date.now());
    setStorageError(false);
    fetchSlides();
    toast({
      title: "Refreshed",
      description: "Slides have been refreshed.",
    });
  }
};

export default Invest;
