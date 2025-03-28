
import { supabase } from '@/integrations/supabase/client';
import { Slide, STORAGE_BUCKET, SLIDES_FOLDER, SLIDES_ORDER_FILE } from '@/types/slideTypes';
import { ensureSlidesFolderExists, fetchSlidesOrder, saveSlidesOrder, generateUniqueFileName, getPublicUrl } from './slideUtils';
import { toast } from "@/hooks/use-toast";

export const uploadSlideFiles = async (
  files: FileList,
  cacheTimestamp: number,
  onSuccess: () => void,
  onError: (error: any) => void
) => {
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

      // Add to order
      currentOrder.push(newFileName);
      
      return {
        url: getPublicUrl(`${SLIDES_FOLDER}/${newFileName}`, cacheTimestamp),
        name: newFileName,
        originalName: file.name
      };
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(Boolean) as Slide[];
    
    if (successfulUploads.length > 0) {
      // Save the updated order
      await saveSlidesOrder(currentOrder);
      onSuccess();
      
      toast({
        title: "Success",
        description: `${successfulUploads.length} slides uploaded successfully`,
      });
    }
  } catch (error) {
    console.error('Error uploading files:', error);
    onError(error);
    
    toast({
      title: "Error",
      description: `Failed to upload slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive",
    });
  }
};

export const clearAllSlides = async (
  showConfirm: boolean = true,
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  if (showConfirm && !window.confirm("Are you sure you want to delete all slides? This action cannot be undone.")) {
    return;
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
      onSuccess();
      
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
    onError(error);
    
    if (showConfirm) {
      toast({
        title: "Error",
        description: `Failed to delete slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  }
};

export const deleteSlide = async (
  slideIndex: number,
  slides: Slide[],
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  if (!window.confirm(`Are you sure you want to delete slide ${slideIndex + 1}?`)) {
    return;
  }
  
  try {
    // Get the slide to delete
    const slideToDelete = slides[slideIndex];
    
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
    onSuccess();
    
    toast({
      title: "Success",
      description: "Slide deleted successfully",
    });
  } catch (error) {
    console.error('Error deleting slide:', error);
    onError(error);
    
    toast({
      title: "Error",
      description: `Failed to delete slide: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive",
    });
  }
};

export const moveSlide = async (
  sourceIndex: number,
  destinationIndex: number,
  slides: Slide[],
  onSuccess: (newSlides: Slide[], timestamp: number) => void,
  onError: (error: any) => void
) => {
  if (sourceIndex === destinationIndex) return;
  
  // Validate indices to prevent errors
  if (sourceIndex < 0 || sourceIndex >= slides.length || 
      destinationIndex < 0 || destinationIndex >= slides.length) {
    console.error(`Invalid indices: source=${sourceIndex}, destination=${destinationIndex}, total slides=${slides.length}`);
    return;
  }
  
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
    const newSlides = [...slides];
    const [movedSlide] = newSlides.splice(sourceIndex, 1);
    newSlides.splice(destinationIndex, 0, movedSlide);
    
    // Update the timestamp to prevent caching issues
    const timestamp = Date.now();
    
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
    onSuccess(updatedSlides, timestamp);
    
    toast({
      title: "Success",
      description: "Slides reordered successfully",
    });
  } catch (error) {
    console.error('Error reordering slides:', error);
    onError(error);
    
    toast({
      title: "Error",
      description: `Failed to reorder slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
      variant: "destructive",
    });
  }
};
