
import { toast } from "@/hooks/use-toast";
import { Slide } from '@/types/slideTypes';
import { supabase } from '@/integrations/supabase/client';
import {
  saveSlidesOrder,
  getSlidesOrder,
  generateUniqueFileName,
  getPublicUrl
} from './fileSystem';

// Constants
const STORAGE_BUCKET = 'lovable-uploads';
const SLIDES_FOLDER = 'slides';

// Upload slide files
export const uploadSlideFiles = async (
  files: FileList,
  cacheTimestamp: number,
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  try {
    // Get current slides order
    const currentOrder = await getSlidesOrder();
    
    // Upload each file to Supabase
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

      // Upload to Supabase
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
      const saveSuccess = await saveSlidesOrder(currentOrder);
      if (!saveSuccess) {
        throw new Error("Failed to save slides order");
      }
      
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

// Clear all slides
export const clearAllSlides = async (
  showConfirm: boolean = true,
  onSuccess: () => void,
  onError: (error: any) => void
) => {
  if (showConfirm && !window.confirm("Are you sure you want to delete all slides? This action cannot be undone.")) {
    return;
  }

  try {
    // List files from Supabase
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(SLIDES_FOLDER);
    
    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      const filesToDelete = data
        .filter(file => 
          file.name.toLowerCase().endsWith('.jpg') || 
          file.name.toLowerCase().endsWith('.jpeg') || 
          file.name.toLowerCase().endsWith('.png'))
        .map(file => `${SLIDES_FOLDER}/${file.name}`);
      
      if (filesToDelete.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .remove(filesToDelete);

        if (deleteError) {
          throw deleteError;
        }
      }
      
      // Reset the order in localStorage
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

// Delete a single slide
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
    const { error: deleteError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([`${SLIDES_FOLDER}/${slideToDelete.name}`]);
    
    if (deleteError) {
      throw deleteError;
    }
    
    // Update the slides order
    const currentOrder = await getSlidesOrder();
    const updatedOrder = currentOrder.filter(name => name !== slideToDelete.name);
    
    const saveSuccess = await saveSlidesOrder(updatedOrder);
    if (!saveSuccess) {
      throw new Error("Failed to save updated slides order");
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

// Move a slide (reorder)
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
    
    // Save the new order to localStorage
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
        
        // Get public URL from Supabase
        const { data } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(`${SLIDES_FOLDER}/${name}`);
          
        // Create a placeholder in case the original is not found
        return {
          name: name,
          url: `${data.publicUrl}?t=${timestamp}`
        };
      }
      
      // Get updated URL with new timestamp
      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(`${SLIDES_FOLDER}/${name}`);
        
      return {
        ...originalSlide,
        url: `${data.publicUrl}?t=${timestamp}`
      };
    });
    
    console.log("Reordered slides to return:", updatedSlides);
    
    // Update the UI with the refreshed slides
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
