
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Slide, STORAGE_BUCKET, SLIDES_FOLDER } from '@/types/slideTypes';
import { supabase } from '@/integrations/supabase/client';
import {
  getSlidesOrder,
  saveSlidesOrder,
  getPublicUrl
} from '@/utils/browserSlideUtils';
import {
  uploadSlideFiles,
  clearAllSlides,
  deleteSlide,
  moveSlide
} from '@/utils/slideOperations';

export const useSlideManagement = () => {
  const [currentSlides, setCurrentSlides] = useState<Slide[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(Date.now());
  const [storageError, setStorageError] = useState<boolean>(false);
  const { toast } = useToast();

  const checkCurrentSlides = async (forceTimestamp = null) => {
    try {
      setStorageError(false);
      const timestamp = forceTimestamp || Date.now();
      setCacheTimestamp(timestamp);
      
      // List files from Supabase storage
      const { data: files, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(SLIDES_FOLDER);
      
      if (error) {
        console.error('Error listing slides from storage:', error);
        setStorageError(true);
        setCurrentSlides([]);
        return;
      }
      
      // Filter for actual image files
      const imageFiles = files
        ? files.filter(file => 
            file.name.toLowerCase().endsWith('.jpg') || 
            file.name.toLowerCase().endsWith('.jpeg') || 
            file.name.toLowerCase().endsWith('.png'))
            .map(file => file.name)
        : [];
      
      console.log(`Found ${imageFiles.length} image files in storage`);
      
      // Get the slides order
      const slideOrder = await getSlidesOrder();
      console.log('Retrieved slides order:', slideOrder);
      
      if (!slideOrder || slideOrder.length === 0) {
        // No valid order file exists, create a new one based on all found files
        if (imageFiles.length > 0) {
          // Generate slide objects
          const slideFiles = imageFiles.map(file => {
            // Get public URL from Supabase
            const { data } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(`${SLIDES_FOLDER}/${file}`);
              
            return {
              url: `${data.publicUrl}?t=${timestamp}`,
              name: file
            };
          });
          
          setCurrentSlides(slideFiles);
          
          // Save the new order
          await saveSlidesOrder(imageFiles);
        } else {
          console.log('No image files found, setting empty slides');
          setCurrentSlides([]);
        }
      } else {
        // Use the order from localStorage
        console.log(`Using slides order from localStorage with ${slideOrder.length} slides`);
        
        // Create a set of actual files for quick lookups
        const existingFileNames = new Set(imageFiles);
        
        // Filter the slides order to only include files that actually exist
        const validSlideNames = slideOrder.filter(name => existingFileNames.has(name));
        
        console.log(`Valid slide names based on order file:`, validSlideNames);
        
        // If we still have valid slides, create the slide objects
        if (validSlideNames.length > 0) {
          // Generate slide objects in the correct order
          const slideFiles = validSlideNames.map(name => {
            // Get public URL from Supabase
            const { data } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(`${SLIDES_FOLDER}/${name}`);
              
            return {
              url: `${data.publicUrl}?t=${timestamp}`,
              name: name
            };
          });
          
          console.log("Setting current slides with ordered files:", slideFiles);
          setCurrentSlides(slideFiles);
          
          // If the valid names are different than what was in localStorage, update it
          if (validSlideNames.length !== slideOrder.length) {
            await saveSlidesOrder(validSlideNames);
          }
        } else {
          // If no valid slides are left, check if there are any images and create a new order
          if (imageFiles.length > 0) {
            // Generate slide objects
            const slideFiles = imageFiles.map(file => {
              // Get public URL from Supabase
              const { data } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(`${SLIDES_FOLDER}/${file}`);
                
              return {
                url: `${data.publicUrl}?t=${timestamp}`,
                name: file
              };
            });
            
            console.log("No valid ordered slides, using all image files:", slideFiles);
            setCurrentSlides(slideFiles);
            
            // Save the new order
            await saveSlidesOrder(imageFiles);
          } else {
            console.log("No slides found at all");
            setCurrentSlides([]);
          }
        }
      }
    } catch (error) {
      console.error('Error checking current slides:', error);
      setStorageError(true);
      setCurrentSlides([]);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadLoading(true);
    
    try {
      await uploadSlideFiles(
        files, 
        cacheTimestamp,
        () => {
          const newTimestamp = Date.now();
          setCacheTimestamp(newTimestamp);
          checkCurrentSlides(newTimestamp);
          
          toast({
            title: "Success",
            description: `${files.length} slides uploaded successfully`,
          });
        },
        (error) => {
          setStorageError(true);
          
          toast({
            title: "Error",
            description: `Failed to upload slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleClearAllSlides = async (showConfirm = true) => {
    if (showConfirm) {
      setUploadLoading(true);
    }

    try {
      await clearAllSlides(
        showConfirm,
        () => {
          setCurrentSlides([]);
          toast({
            title: "Success",
            description: "All slides have been cleared",
          });
        },
        (error) => {
          setStorageError(true);
          
          toast({
            title: "Error",
            description: `Failed to delete slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      );
    } finally {
      if (showConfirm) {
        setUploadLoading(false);
      }
    }
  };

  const handleDeleteSlide = async (slideIndex: number) => {
    setUploadLoading(true);
    
    try {
      await deleteSlide(
        slideIndex,
        currentSlides,
        async () => {
          const newTimestamp = Date.now();
          setCacheTimestamp(newTimestamp);
          await checkCurrentSlides(newTimestamp);
          
          toast({
            title: "Success",
            description: "Slide deleted successfully",
          });
        },
        (error) => {
          setStorageError(true);
          checkCurrentSlides();
          
          toast({
            title: "Error",
            description: `Failed to delete slide: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleMoveSlide = async (sourceIndex: number, destinationIndex: number) => {
    setUploadLoading(true);
    
    try {
      console.log(`Starting move slide operation: source=${sourceIndex}, destination=${destinationIndex}`);
      console.log("Current slides before move:", currentSlides);
      
      await moveSlide(
        sourceIndex,
        destinationIndex,
        currentSlides,
        (updatedSlides, timestamp) => {
          console.log('Slide moved successfully, updated slides:', updatedSlides);
          setCurrentSlides(updatedSlides);
          setCacheTimestamp(timestamp);
          
          toast({
            title: "Success",
            description: "Slides reordered successfully",
          });
        },
        async (error) => {
          console.error('Error during move operation:', error);
          setStorageError(true);
          // Force a refresh to ensure we have the latest data
          const newTimestamp = Date.now();
          setCacheTimestamp(newTimestamp);
          await checkCurrentSlides(newTimestamp);
          
          toast({
            title: "Error",
            description: `Failed to reorder slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
            variant: "destructive",
          });
        }
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRefreshCache = async () => {
    setUploadLoading(true);
    try {
      const newTimestamp = Date.now();
      setCacheTimestamp(newTimestamp);
      await checkCurrentSlides(newTimestamp);
      
      toast({
        title: "Success",
        description: "Slide cache refreshed",
      });
    } catch (error) {
      console.error('Error refreshing cache:', error);
      setStorageError(true);
      toast({
        title: "Error",
        description: "Failed to refresh slide cache",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Initialize slides on component mount
  useEffect(() => {
    checkCurrentSlides();
  }, []);

  return {
    currentSlides,
    uploadLoading,
    storageError,
    checkCurrentSlides,
    handleFileUpload,
    handleClearAllSlides,
    handleDeleteSlide,
    handleMoveSlide,
    handleRefreshCache
  };
};
