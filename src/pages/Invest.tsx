
import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import Cookies from 'js-cookie';
import { ChevronUp, ChevronDown, Maximize, Minimize, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { createBucketIfNotExists } from '@/utils/createBucket';
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarRail
} from "@/components/ui/sidebar";

const COOKIE_NAME = 'investor_authenticated';
const STORAGE_BUCKET = "investor_docs";
const SLIDES_FOLDER = "slides";
const SLIDES_ORDER_FILE = "slides_order.json";

interface SlidesOrder {
  slides: string[];
  lastUpdated: number;
}

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
  // Add a timestamp to force cache refresh when needed
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(Date.now());

  useEffect(() => {
    const checkAuthorization = async () => {
      // Ensure the storage bucket exists
      try {
        await createBucketIfNotExists(STORAGE_BUCKET);
      } catch (err) {
        console.error('Error ensuring storage bucket exists:', err);
        setStorageError(true);
      }

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

  // Create slides folder if it doesn't exist
  const ensureSlidesFolderExists = async (): Promise<boolean> => {
    try {
      setStorageError(false);
      
      // Try to list the slides folder to see if it exists
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(`${SLIDES_FOLDER}/`);
      
      if (error) {
        console.log('Creating slides folder...');
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(`${SLIDES_FOLDER}/.folder`, new Blob([''], { type: 'text/plain' }), {
            upsert: true
          });
        
        if (uploadError) {
          console.error('Error creating slides folder:', uploadError);
          setStorageError(true);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error ensuring slides folder exists:', error);
      setStorageError(true);
      return false;
    }
  };

  const fetchSlidesOrder = async (): Promise<SlidesOrder | null> => {
    try {
      setStorageError(false);
      
      // Make sure slides folder exists before trying to fetch order file
      const folderExists = await ensureSlidesFolderExists();
      if (!folderExists) {
        return null;
      }
      
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(`${SLIDES_FOLDER}/${SLIDES_ORDER_FILE}`);
      
      if (error) {
        console.log('No slides order file found');
        return null;
      }
      
      const text = await data.text();
      return JSON.parse(text) as SlidesOrder;
    } catch (error) {
      console.error('Error fetching slides order:', error);
      return null;
    }
  };

  const fetchSlides = async () => {
    try {
      // Update the cache timestamp to force new data loading
      setCacheTimestamp(Date.now());
      setStorageError(false);
      
      // Make sure the bucket and folder exist
      await createBucketIfNotExists(STORAGE_BUCKET);
      const folderExists = await ensureSlidesFolderExists();
      if (!folderExists) {
        setSlidesUrls([]);
        return;
      }
      
      // First try to get the slides order
      const slidesOrder = await fetchSlidesOrder();
      
      // Get all files in the slides folder to check what actually exists
      const { data: allFiles, error: listError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(`${SLIDES_FOLDER}/`);
      
      if (listError) {
        console.error('Error listing files in slides folder:', listError);
        setStorageError(true);
        setSlidesUrls([]);
        return;
      }
      
      // Filter for actual image files
      const imageFiles = allFiles.filter(file => 
        (file.name.toLowerCase().endsWith('.jpg') || 
        file.name.toLowerCase().endsWith('.jpeg') || 
        file.name.toLowerCase().endsWith('.png')) && 
        file.name !== SLIDES_ORDER_FILE && 
        file.name !== '.folder'
      );
      
      console.log(`Found ${imageFiles.length} image files in storage`);
      
      if (slidesOrder && slidesOrder.slides.length > 0) {
        // Use the order from the file
        console.log('Using slides order from file for viewing');
        
        // Create a set of actual files for quick lookups
        const existingFileNames = new Set(imageFiles.map(file => file.name));
        
        // Filter the slides order to only include files that actually exist
        const validSlideNames = slidesOrder.slides.filter(name => existingFileNames.has(name));
        
        if (validSlideNames.length > 0) {
          // Generate URLs in the correct order
          const urls = validSlideNames.map(name => {
            const { data } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(`${SLIDES_FOLDER}/${name}`);
            
            return `${data.publicUrl}?t=${cacheTimestamp}`;
          });
          
          setSlidesUrls(urls);
        } else if (imageFiles.length > 0) {
          // If order file doesn't contain valid files but we found images, use those
          const urls = imageFiles.map(file => {
            const { data } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(`${SLIDES_FOLDER}/${file.name}`);
            
            return `${data.publicUrl}?t=${cacheTimestamp}`;
          });
          
          setSlidesUrls(urls);
        } else {
          // No valid images found
          setSlidesUrls([]);
        }
      } else if (imageFiles.length > 0) {
        // No order file, use the images we found directly
        const urls = imageFiles.map(file => {
          const { data } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(`${SLIDES_FOLDER}/${file.name}`);
          
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
            setSlidesUrls([]);
          }
        } catch (staticError) {
          console.error('Error loading static slides:', staticError);
          toast({
            title: "Error",
            description: "Failed to load presentation slides.",
            variant: "destructive",
          });
          setSlidesUrls([]);
        }
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

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slidesUrls.length) {
      setCurrentSlideIndex(index);
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

  const refreshSlides = async () => {
    setCacheTimestamp(Date.now());
    await fetchSlides();
    toast({
      title: "Refreshed",
      description: "Slides have been refreshed.",
    });
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        goToPreviousSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'r' || e.key === 'R') {
        refreshSlides();
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
    <SidebarProvider defaultOpen={isSidebarOpen}>
      <div className="min-h-screen bg-gray-900 flex flex-col w-full">
        <div className="container mx-auto px-0 py-0 flex-grow flex">
          <Sidebar collapsible="offcanvas" variant="inset">
            <SidebarContent className="p-2">
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
                    <p className="text-sm">There was an issue accessing the slides storage. Please try refreshing.</p>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={refreshSlides}
                >
                  Refresh Slides
                </Button>
              </div>
            </SidebarContent>
            <SidebarRail />
          </Sidebar>
          
          <div className="flex-1 bg-gray-800 rounded-lg shadow-xl overflow-hidden">
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
              {slidesUrls.length > 0 ? (
                <>
                  <img 
                    src={slidesUrls[currentSlideIndex]} 
                    alt={`Slide ${currentSlideIndex + 1}`}
                    className="max-h-full max-w-full object-contain"
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
    </SidebarProvider>
  );
};

export default Invest;
