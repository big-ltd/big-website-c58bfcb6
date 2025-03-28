
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Slide } from '@/types/slideTypes';
import {
  getSlidesOrder,
  saveSlidesOrder,
  getSlideUrl,
  getAllSlidesData,
  processFileUpload,
  deleteSlideData,
  clearAllSlidesData,
  downloadAllSlides
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
      
      // Get slides order from localStorage
      const slideOrder = await getSlidesOrder();
      console.log('Retrieved slides order:', slideOrder);
      
      // Get all slides data
      const allSlidesData = await getAllSlidesData();
      
      // Create slide objects from the order
      if (slideOrder && slideOrder.length > 0) {
        const slidePromises = slideOrder.map(async (filename) => {
          const slideData = allSlidesData[filename];
          if (slideData) {
            return slideData;
          }
          
          // If the slide data isn't in localStorage, create a fallback
          return {
            name: filename,
            url: await getSlideUrl(filename, timestamp)
          };
        });
        
        const slideObjects = await Promise.all(slidePromises);
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
      
      // Array to store new slide objects
      const newSlides: Slide[] = [];
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const slide = await processFileUpload(file);
        
        if (slide) {
          newSlides.push(slide);
          currentOrder.push(slide.name);
        } else {
          toast({
            title: "Error",
            description: `Failed to process ${file.name}`,
            variant: "destructive",
          });
        }
      }
      
      // Update the slides order in localStorage
      await saveSlidesOrder(currentOrder);
      
      // Update state with the new slides
      setCurrentSlides(prev => [...prev, ...newSlides]);
      
      if (newSlides.length > 0) {
        toast({
          title: "Success",
          description: `${newSlides.length} slides added. We've initiated downloads to help you save these files.`,
        });
      }
    } catch (error) {
      console.error('Error processing files:', error);
      setStorageError(true);
      toast({
        title: "Error",
        description: `Failed to process slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  // Clear all slides
  const handleClearAllSlides = async (showConfirm = true) => {
    if (showConfirm && !window.confirm("Are you sure you want to clear all slides? This will only remove them from the preview.")) {
      return;
    }
    
    setUploadLoading(true);
    
    try {
      // Clear all slides data
      await clearAllSlidesData();
      
      // Clear the slides order
      await saveSlidesOrder([]);
      
      // Update state
      setCurrentSlides([]);
      
      toast({
        title: "Success",
        description: "All slides have been cleared from the preview.",
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
      
      // Delete the slide data
      await deleteSlideData(slideToDelete.name);
      
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
        description: "Slide removed successfully",
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

  // Download all slides as ZIP
  const handleDownloadAllSlides = async () => {
    setUploadLoading(true);
    try {
      const success = await downloadAllSlides();
      
      if (success) {
        toast({
          title: "Success",
          description: "All slides downloaded as ZIP file",
        });
      } else {
        throw new Error("Failed to download slides");
      }
    } catch (error) {
      console.error('Error downloading slides:', error);
      toast({
        title: "Error",
        description: `Failed to download slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
    handleRefreshCache,
    handleDownloadAllSlides
  };
};
