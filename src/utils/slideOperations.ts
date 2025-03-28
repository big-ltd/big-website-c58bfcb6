
import { supabase } from '@/integrations/supabase/client';
import { Slide, STORAGE_BUCKET, SLIDES_FOLDER } from '@/types/slideTypes';
import { saveSlidesOrder, getSlidesOrder, generateUniqueFileName, getPublicUrl } from './browserSlideUtils';
import { useToast } from "@/hooks/use-toast";

export const uploadSlideFiles = async (
  files: FileList,
  cacheTimestamp: number,
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  try {
    // First get the current slides order
    const currentOrder = await getSlidesOrder();
    
    // Upload each file to Supabase storage
    const uploadPromises = Array.from(files).map(async (file) => {
      if (!file.type.startsWith('image/')) {
        console.error(`${file.name} is not an image file`);
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
      
      // Get the public URL
      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(`${SLIDES_FOLDER}/${newFileName}`);
      
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
      onSuccess();
    }
  } catch (error) {
    console.error('Error uploading files:', error);
    onError(error);
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
        .filter(file => !file.name.endsWith('.json') && file.name !== '.folder')
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
    }
  } catch (error) {
    console.error('Error deleting slides:', error);
    onError(error);
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
    
    // Delete the file from Supabase
    const { error: deleteError } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .remove([`${SLIDES_FOLDER}/${slideToDelete.name}`]);
    
    if (deleteError) {
      throw deleteError;
    }
    
    // Update the slides order
    const currentOrder = await getSlidesOrder();
    const updatedOrder = currentOrder.filter(name => name !== slideToDelete.name);
    await saveSlidesOrder(updatedOrder);
    
    // Refresh the slides
    onSuccess();
  } catch (error) {
    console.error('Error deleting slide:', error);
    onError(error);
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
    
    // Get the names of all current slides in their current order
    const slideNames = slides.map(slide => slide.name);
    console.log("Current slide order before move:", slideNames);
    
    // Create a new array with the updated order
    const newOrder = [...slideNames];
    
    // Move the item - remove from source and insert at destination
    const [movedItem] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(destinationIndex, 0, movedItem);
    
    console.log("New slide order after move:", newOrder);
    
    // Save the new order
    const saveSuccess = await saveSlidesOrder(newOrder);
    if (!saveSuccess) {
      throw new Error("Failed to save reordered slides");
    }
    
    // Create a new timestamp for cache busting
    const timestamp = Date.now();
    
    // Create updated slides array with new order and updated timestamps
    const updatedSlides = newOrder.map(name => {
      const originalSlide = slides.find(slide => slide.name === name);
      if (!originalSlide) {
        console.error(`Could not find original slide with name ${name}`);
        // Create a placeholder in case the original is not found
        return {
          name: name,
          url: getPublicUrl(name, timestamp)
        };
      }
      
      return {
        ...originalSlide,
        url: getPublicUrl(originalSlide.name, timestamp)
      };
    });
    
    console.log("Reordered slides to return:", updatedSlides);
    
    // Update the UI with the refreshed slides
    onSuccess(updatedSlides, timestamp);
  } catch (error) {
    console.error('Error reordering slides:', error);
    onError(error);
  }
};
