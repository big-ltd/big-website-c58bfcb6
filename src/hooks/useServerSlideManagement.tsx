
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Slide } from '@/types/slideTypes';
import {
  uploadSlidesToServer,
  fetchSlidesFromServer,
  clearAllSlidesFromServer,
  deleteSingleSlideFromServer,
  moveSlideOnServer
} from '@/services/serverSlideService';

export const useServerSlideManagement = () => {
  const [currentSlides, setCurrentSlides] = useState<Slide[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(Date.now());
  const { toast } = useToast();

  // Function to fetch slides from the server
  const fetchSlides = useCallback(async (forceTimestamp = null) => {
    try {
      setUploadLoading(true);
      
      const timestamp = forceTimestamp || Date.now();
      setCacheTimestamp(timestamp);
      
      const slides = await fetchSlidesFromServer();
      
      // Add timestamp to URLs to prevent caching
      const slidesWithTimestamp = slides.map(slide => ({
        ...slide,
        url: `${slide.url}?t=${timestamp}`
      }));
      
      setCurrentSlides(slidesWithTimestamp);
      console.log('Slides updated in state:', slidesWithTimestamp);
    } catch (error) {
      console.error('Error fetching slides:', error);
      toast({
        title: "Error",
        description: "Failed to fetch slides from the server.",
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  }, [toast]);

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadLoading(true);
    
    try {
      await uploadSlidesToServer(files);
      
      // After upload, fetch the latest slides
      await fetchSlides();
      
      toast({
        title: "Success",
        description: `${files.length} slides uploaded successfully.`,
      });
      
      // Clear the input to allow re-uploading the same files
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading files:', error);
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
  const handleClearAllSlides = async () => {
    if (!window.confirm("Are you sure you want to clear all slides? This action cannot be undone.")) {
      return;
    }
    
    setUploadLoading(true);
    
    try {
      await clearAllSlidesFromServer();
      
      // Update state
      setCurrentSlides([]);
      
      toast({
        title: "Success",
        description: "All slides have been cleared from the server.",
      });
    } catch (error) {
      console.error('Error clearing slides:', error);
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
      
      // Delete the slide from the server
      await deleteSingleSlideFromServer(slideToDelete.name);
      
      // Refresh slides from server to get the updated list
      await fetchSlides();
      
      toast({
        title: "Success",
        description: "Slide removed successfully",
      });
    } catch (error) {
      console.error('Error deleting slide:', error);
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
      // Send the move request to the server
      const updatedSlides = await moveSlideOnServer(sourceIndex, destinationIndex);
      
      // Add timestamp to URLs to prevent caching
      const slidesWithTimestamp = updatedSlides.map(slide => ({
        ...slide,
        url: `${slide.url}?t=${cacheTimestamp}`
      }));
      
      // Update state with the new order
      setCurrentSlides(slidesWithTimestamp);
      
      toast({
        title: "Success",
        description: "Slides reordered successfully",
      });
    } catch (error) {
      console.error('Error moving slide:', error);
      toast({
        title: "Error",
        description: `Failed to reorder slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      
      // Refresh slides to ensure we have the latest data
      fetchSlides();
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
      await fetchSlides(newTimestamp);
      
      toast({
        title: "Success",
        description: "Slide cache refreshed",
      });
    } catch (error) {
      console.error('Error refreshing cache:', error);
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
    fetchSlides();
  }, [fetchSlides]);

  return {
    currentSlides,
    uploadLoading,
    checkCurrentSlides: fetchSlides,
    handleFileUpload,
    handleClearAllSlides,
    handleDeleteSlide,
    handleMoveSlide,
    handleRefreshCache
  };
};
