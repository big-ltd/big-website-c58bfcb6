
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Slide, SLIDES_FOLDER, STORAGE_BUCKET } from '@/types/slideTypes';
import { supabase } from '@/integrations/supabase/client';
import {
  getSlidesOrder,
  saveSlidesOrder,
  getPublicUrl,
  generateUniqueFileName
} from '@/utils/browserSlideUtils';

export const useSlideManagement = () => {
  const [currentSlides, setCurrentSlides] = useState<Slide[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(Date.now());
  const [storageError, setStorageError] = useState<boolean>(false);
  const { toast } = useToast();

  // Function to check and load current slides
  const checkCurrentSlides = async (forceTimestamp = null) => {
    try {
      setStorageError(false);
      const timestamp = forceTimestamp || Date.now();
      setCacheTimestamp(timestamp);
      
      // Get slides order from localStorage or Supabase
      const slideOrder = await getSlidesOrder();
      console.log('Retrieved slides order:', slideOrder);
      
      // Create slide objects from the order
      if (slideOrder && slideOrder.length > 0) {
        const slideObjects = slideOrder.map(filename => ({
          name: filename,
          url: getPublicUrl(filename, timestamp)
        }));
        
        setCurrentSlides(slideObjects);
      } else {
        setCurrentSlides([]);
      }
    } catch (error) {
      console.error('Error checking current slides:', error);
      setStorageError(true);
      setCurrentSlides([]);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadLoading(true);
    
    try {
      // Get current order
      const currentOrder = await getSlidesOrder();
      
      // Create slides directory if it doesn't exist
      console.log(`Using slides folder: /${SLIDES_FOLDER}/`);
      
      // Array to store new slide objects
      const newSlides: Slide[] = [];
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Error",
            description: `${file.name} is not an image file`,
            variant: "destructive",
          });
          continue;
        }
        
        // Generate a unique filename
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const newFileName = generateUniqueFileName(fileExtension);
        
        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(`${SLIDES_FOLDER}/${newFileName}`, file, {
            cacheControl: '0',
            upsert: true
          });
        
        if (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast({
            title: "Upload Error",
            description: `Failed to upload ${file.name}: ${error.message}`,
            variant: "destructive",
          });
          continue;
        }
        
        // Get public URL
        const url = getPublicUrl(newFileName, cacheTimestamp);
        
        // Create a slide object 
        const newSlide: Slide = {
          name: newFileName,
          url: url,
          originalName: file.name
        };
        
        // Add to our arrays
        newSlides.push(newSlide);
        currentOrder.push(newFileName);
        
        console.log(`Stored slide in /${SLIDES_FOLDER}/${newFileName}`);
      }
      
      // Update the slides order
      await saveSlidesOrder(currentOrder);
      
      // Update state with the new slides
      setCurrentSlides(prev => [...prev, ...newSlides]);
      
      if (newSlides.length > 0) {
        toast({
          title: "Success",
          description: `${newSlides.length} slides uploaded successfully to /${SLIDES_FOLDER}/`,
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      setStorageError(true);
      toast({
        title: "Error",
        description: `Failed to upload slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Clear all slides
  const handleClearAllSlides = async (showConfirm = true) => {
    if (showConfirm && !window.confirm("Are you sure you want to delete all slides? This action cannot be undone.")) {
      return;
    }
    
    setUploadLoading(true);
    
    try {
      // Get list of files in the slides folder
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(SLIDES_FOLDER);
      
      if (error) {
        throw error;
      }
      
      // Delete all files except slides_order.json
      if (data && data.length > 0) {
        const filesToDelete = data
          .filter(file => file.name !== 'slides_order.json' && !file.name.endsWith('.folder'))
          .map(file => `${SLIDES_FOLDER}/${file.name}`);
          
        if (filesToDelete.length > 0) {
          const { error: deleteError } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove(filesToDelete);
            
          if (deleteError) {
            console.error('Error deleting slides:', deleteError);
          }
        }
      }
      
      // Clear the order
      await saveSlidesOrder([]);
      
      // Update state
      setCurrentSlides([]);
      
      toast({
        title: "Success",
        description: "All slides have been cleared",
      });
    } catch (error) {
      console.error('Error clearing slides:', error);
      setStorageError(true);
      toast({
        title: "Error",
        description: `Failed to clear slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Delete a single slide
  const handleDeleteSlide = async (slideIndex: number) => {
    if (!window.confirm(`Are you sure you want to delete slide ${slideIndex + 1}?`)) {
      return;
    }
    
    setUploadLoading(true);
    
    try {
      // Get the slide to delete
      const slideToDelete = currentSlides[slideIndex];
      
      // Delete from Supabase storage
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([`${SLIDES_FOLDER}/${slideToDelete.name}`]);
        
      if (error) {
        throw error;
      }
      
      // Update the order
      const currentOrder = await getSlidesOrder();
      const updatedOrder = currentOrder.filter(name => name !== slideToDelete.name);
      await saveSlidesOrder(updatedOrder);
      
      // Update state
      const newSlides = [...currentSlides];
      newSlides.splice(slideIndex, 1);
      setCurrentSlides(newSlides);
      
      toast({
        title: "Success",
        description: "Slide deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting slide:', error);
      setStorageError(true);
      toast({
        title: "Error",
        description: `Failed to delete slide: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Move a slide (change position)
  const handleMoveSlide = async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    
    setUploadLoading(true);
    
    try {
      // Create a new array with the moved item
      const newSlides = [...currentSlides];
      const [movedItem] = newSlides.splice(sourceIndex, 1);
      newSlides.splice(destinationIndex, 0, movedItem);
      
      // Update state
      setCurrentSlides(newSlides);
      
      // Update the order
      const newOrder = newSlides.map(slide => slide.name);
      await saveSlidesOrder(newOrder);
      
      toast({
        title: "Success",
        description: "Slides reordered successfully",
      });
    } catch (error) {
      console.error('Error moving slide:', error);
      setStorageError(true);
      toast({
        title: "Error",
        description: `Failed to reorder slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      
      // Refresh slides to ensure we have the latest data
      checkCurrentSlides();
    } finally {
      setUploadLoading(false);
    }
  };

  // Refresh the cache
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
