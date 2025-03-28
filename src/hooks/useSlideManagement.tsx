
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

const STORAGE_BUCKET = "investor_docs";
const SLIDES_FOLDER = "slides";
const SLIDES_ORDER_FILE = "slides_order.json";

interface Slide {
  url: string;
  name: string;
  originalName?: string;
}

interface SlidesOrder {
  slides: string[];
  lastUpdated: number;
}

export const useSlideManagement = () => {
  const [currentSlides, setCurrentSlides] = useState<Slide[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(Date.now());
  const [storageError, setStorageError] = useState<boolean>(false);
  const { toast } = useToast();

  // Create slides folder if it doesn't exist
  const ensureSlidesFolderExists = async (): Promise<boolean> => {
    try {
      setStorageError(false);
      
      // Try to list the slides folder to see if it exists
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(SLIDES_FOLDER);
      
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
        console.log('No slides order file found, will create one');
        return null;
      }
      
      const text = await data.text();
      return JSON.parse(text) as SlidesOrder;
    } catch (error) {
      console.error('Error fetching slides order:', error);
      return null;
    }
  };

  const saveSlidesOrder = async (slideNames: string[]): Promise<void> => {
    try {
      const orderData: SlidesOrder = {
        slides: slideNames,
        lastUpdated: Date.now()
      };
      
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(`${SLIDES_FOLDER}/${SLIDES_ORDER_FILE}`, 
          JSON.stringify(orderData, null, 2),
          { 
            contentType: 'application/json',
            upsert: true,
            cacheControl: '0'
          }
        );
      
      if (error) {
        throw error;
      }
      
      console.log('Slides order saved successfully');
    } catch (error) {
      console.error('Error saving slides order:', error);
      setStorageError(true);
      throw error;
    }
  };

  const generateUniqueFileName = (fileExtension: string): string => {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 100000);
    return `${timestamp}_${randomId}.${fileExtension}`;
  };

  const verifyFileExists = async (path: string): Promise<boolean> => {
    try {
      // Try to get the file's public URL
      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(`${path}`);
      
      // Try to check if the file exists with a HEAD request
      try {
        const response = await fetch(data.publicUrl, { method: 'HEAD' });
        return response.ok;
      } catch (fetchError) {
        console.error(`Fetch error for ${path}:`, fetchError);
        return false;
      }
    } catch (error) {
      console.error(`File verification failed for ${path}:`, error);
      return false;
    }
  };

  const checkCurrentSlides = async (forceTimestamp = null) => {
    try {
      setStorageError(false);
      const timestamp = forceTimestamp || Date.now();
      setCacheTimestamp(timestamp);
      
      // Make sure slides folder exists
      const folderExists = await ensureSlidesFolderExists();
      if (!folderExists) {
        console.error('Could not ensure slides folder exists');
        setCurrentSlides([]);
        return;
      }
      
      // Get all files in the slides folder
      const { data: allFiles, error: listError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .list(`${SLIDES_FOLDER}/`);
      
      if (listError) {
        console.error('Error listing slides folder:', listError);
        setStorageError(true);
        setCurrentSlides([]);
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
      
      // First, get the slides order file
      const slidesOrder = await fetchSlidesOrder();
      
      if (!slidesOrder || slidesOrder.slides.length === 0) {
        // No valid order file exists, create a new one based on all found files
        const slideNames = imageFiles.map(file => file.name);
        
        console.log(`Creating new slides order with ${slideNames.length} files`);
        
        if (slideNames.length > 0) {
          await saveSlidesOrder(slideNames);
          
          // Generate slide objects
          const slideFiles = imageFiles.map(file => {
            const { data } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(`${SLIDES_FOLDER}/${file.name}`);
            return {
              url: `${data.publicUrl}?t=${timestamp}`,
              name: file.name
            };
          });
          
          setCurrentSlides(slideFiles);
        } else {
          console.log('No image files found, setting empty slides');
          setCurrentSlides([]);
        }
      } else {
        // Use the order from the file
        console.log(`Using slides order from file:`, slidesOrder);
        
        // Create a set of actual files for quick lookups
        const existingFileNames = new Set(imageFiles.map(file => file.name));
        
        // Filter the slides order to only include files that actually exist
        const validSlideNames = slidesOrder.slides.filter(name => existingFileNames.has(name));
        
        // If some files are missing from the order, update it
        if (validSlideNames.length !== slidesOrder.slides.length) {
          console.log('Updated slides order, removed missing files');
          await saveSlidesOrder(validSlideNames);
        }
        
        // If we still have valid slides, create the slide objects
        if (validSlideNames.length > 0) {
          // Generate slide objects in the correct order
          const slideFiles = validSlideNames.map(name => {
            const { data } = supabase.storage
              .from(STORAGE_BUCKET)
              .getPublicUrl(`${SLIDES_FOLDER}/${name}`);
            return {
              url: `${data.publicUrl}?t=${timestamp}`,
              name: name
            };
          });
          
          setCurrentSlides(slideFiles);
        } else {
          // If no valid slides are left, check if there are any images and create a new order
          if (imageFiles.length > 0) {
            const newSlideNames = imageFiles.map(file => file.name);
            await saveSlidesOrder(newSlideNames);
            
            // Generate slide objects
            const slideFiles = imageFiles.map(file => {
              const { data } = supabase.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(`${SLIDES_FOLDER}/${file.name}`);
              return {
                url: `${data.publicUrl}?t=${timestamp}`,
                name: file.name
              };
            });
            
            setCurrentSlides(slideFiles);
          } else {
            setCurrentSlides([]);
          }
        }
      }
      
      console.log('Slides refreshed from storage.');
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
      // Ensure slides folder exists
      const folderExists = await ensureSlidesFolderExists();
      if (!folderExists) {
        throw new Error('Could not create slides folder');
      }
      
      // First get the current slides order
      const slidesOrder = await fetchSlidesOrder();
      const currentOrder = slidesOrder ? [...slidesOrder.slides] : [];
      
      // Upload each file with a unique timestamped filename
      const uploadPromises = Array.from(files).map(async (file) => {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Error",
            description: `${file.name} is not an image file`,
            variant: "destructive",
          });
          return null;
        }

        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const newFileName = generateUniqueFileName(fileExtension);

        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(`${SLIDES_FOLDER}/${newFileName}`, file, {
            cacheControl: '0',
            upsert: true
          });

        if (error) {
          console.error(`Upload error for ${file.name}:`, error);
          throw new Error(error.message);
        }

        const { data } = supabase
          .storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(`${SLIDES_FOLDER}/${newFileName}`);
        
        // Add to order
        currentOrder.push(newFileName);
        
        return {
          url: `${data.publicUrl}?t=${cacheTimestamp}`,
          name: newFileName,
          originalName: file.name
        };
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean) as Slide[];
      
      if (successfulUploads.length > 0) {
        // Save the updated order
        await saveSlidesOrder(currentOrder);
        
        // Set the cache timestamp and refresh slides
        const newTimestamp = Date.now();
        setCacheTimestamp(newTimestamp);
        await checkCurrentSlides(newTimestamp);
        
        toast({
          title: "Success",
          description: `${successfulUploads.length} slides uploaded successfully`,
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

  const handleClearAllSlides = async (showConfirm = true) => {
    if (showConfirm && !confirm("Are you sure you want to delete all slides? This action cannot be undone.")) {
      return;
    }

    if (showConfirm) {
      setUploadLoading(true);
    }

    try {
      const { data, error } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .list(SLIDES_FOLDER);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const filesToDelete = data
          .filter(file => file.name !== SLIDES_ORDER_FILE && file.name !== '.folder')
          .map(file => `${SLIDES_FOLDER}/${file.name}`);
        
        if (filesToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .storage
            .from(STORAGE_BUCKET)
            .remove(filesToDelete);

          if (deleteError) {
            throw deleteError;
          }
        }
        
        // Reset the order file
        await saveSlidesOrder([]);
        setCurrentSlides([]);
        
        if (showConfirm) {
          toast({
            title: "Success",
            description: "All slides have been deleted",
          });
        }
      } else if (showConfirm) {
        toast({
          title: "Info",
          description: "No slides to delete",
        });
      }
    } catch (error) {
      console.error('Error deleting slides:', error);
      setStorageError(true);
      if (showConfirm) {
        toast({
          title: "Error",
          description: `Failed to delete slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } finally {
      if (showConfirm) {
        setUploadLoading(false);
      }
    }
  };

  const handleDeleteSlide = async (slideIndex: number) => {
    if (!confirm(`Are you sure you want to delete slide ${slideIndex + 1}?`)) {
      return;
    }

    setUploadLoading(true);
    
    try {
      // Get the slide to delete
      const slideToDelete = currentSlides[slideIndex];
      
      // Delete the file
      const { error: deleteError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .remove([`${SLIDES_FOLDER}/${slideToDelete.name}`]);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Update the slides order
      const slidesOrder = await fetchSlidesOrder();
      if (slidesOrder) {
        const updatedOrder = slidesOrder.slides.filter(name => name !== slideToDelete.name);
        await saveSlidesOrder(updatedOrder);
      }
      
      // Refresh the slides
      setCacheTimestamp(Date.now());
      await checkCurrentSlides();
      
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
      await checkCurrentSlides();
    } finally {
      setUploadLoading(false);
    }
  };

  const handleMoveSlide = async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    
    // Validate indices to prevent errors
    if (sourceIndex < 0 || sourceIndex >= currentSlides.length || 
        destinationIndex < 0 || destinationIndex >= currentSlides.length) {
      console.error(`Invalid indices: source=${sourceIndex}, destination=${destinationIndex}, total slides=${currentSlides.length}`);
      return;
    }
    
    setUploadLoading(true);
    
    try {
      console.log(`Moving slide from index ${sourceIndex} to ${destinationIndex}`);
      
      // Get the current order
      const slidesOrder = await fetchSlidesOrder();
      if (!slidesOrder) {
        throw new Error("Slides order not found");
      }
      
      // Create a new array with the updated order
      const newOrder = [...slidesOrder.slides];
      
      // Move the item - remove from source and insert at destination
      const [movedItem] = newOrder.splice(sourceIndex, 1);
      newOrder.splice(destinationIndex, 0, movedItem);
      
      // Save the new order
      await saveSlidesOrder(newOrder);
      
      // Update the UI immediately with optimistic update
      const newSlides = [...currentSlides];
      const [movedSlide] = newSlides.splice(sourceIndex, 1);
      newSlides.splice(destinationIndex, 0, movedSlide);
      
      // Set the current slides with the optimistic update
      setCurrentSlides(newSlides);
      
      // Update the timestamp to prevent caching issues
      const timestamp = Date.now();
      setCacheTimestamp(timestamp);
      
      // Update the URLs with the new timestamp
      const updatedSlides = newSlides.map(slide => {
        // Extract the URL without the timestamp
        const baseUrl = slide.url.split('?')[0];
        return {
          ...slide,
          url: `${baseUrl}?t=${timestamp}`
        };
      });
      
      // Update the UI with the refreshed URLs
      setCurrentSlides(updatedSlides);
      
      toast({
        title: "Success",
        description: "Slides reordered successfully",
      });
    } catch (error) {
      console.error('Error reordering slides:', error);
      setStorageError(true);
      
      toast({
        title: "Error",
        description: `Failed to reorder slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      
      await checkCurrentSlides();
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
    // Use a short delay on first load to ensure the storage is ready
    const timer = setTimeout(() => {
      checkCurrentSlides();
    }, 500);
    
    return () => clearTimeout(timer);
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
