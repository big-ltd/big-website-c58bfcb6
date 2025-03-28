
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Storage bucket constants
const STORAGE_BUCKET = "investor_docs";
const SLIDES_FOLDER = "slides";

// Type definitions
export interface Slide {
  id: string;
  fileName: string;
  order: number;
  url: string;
}

// Interface that matches the database schema
interface DbSlideRecord {
  id: string;
  filename: string; // Note: lowercase 'n' to match DB schema
  order: number;
  created_at: string;
}

export const useSlideManagement = () => {
  const [uploadLoading, setUploadLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch slides from storage and get their order from the database
  const { data: slides = [], isLoading: slidesLoading, refetch: refetchSlides } = useQuery({
    queryKey: ['slides'],
    queryFn: async () => {
      try {
        // First get the slide order information from the database
        const { data: slideOrderData, error: orderError } = await supabase
          .from('slide_order')
          .select('*')
          .order('order', { ascending: true });

        if (orderError) {
          throw orderError;
        }

        // If no slides in database yet, try to get them from storage
        if (!slideOrderData || slideOrderData.length === 0) {
          // List files from storage
          const { data: storageFiles, error: storageError } = await supabase
            .storage
            .from(STORAGE_BUCKET)
            .list(`${SLIDES_FOLDER}/`, {
              sortBy: { column: 'name', order: 'asc' }
            });

          if (storageError) {
            throw storageError;
          }

          // If files found in storage but not in database, initialize the database
          if (storageFiles && storageFiles.length > 0) {
            const imageFiles = storageFiles.filter(file => 
              file.name.toLowerCase().endsWith('.jpg') || 
              file.name.toLowerCase().endsWith('.jpeg') || 
              file.name.toLowerCase().endsWith('.png')
            );

            // Create slide order entries for existing files
            const slideEntries = imageFiles.map((file, index) => ({
              id: crypto.randomUUID(),
              filename: file.name, // Note: lowercase 'n' to match DB schema
              order: index
            }));

            // Insert entries into database
            if (slideEntries.length > 0) {
              const { error: insertError } = await supabase
                .from('slide_order')
                .insert(slideEntries);
              
              if (insertError) {
                console.error('Error initializing slide order:', insertError);
              }
              
              // Recursively call the function again to get the updated data
              return await queryClient.fetchQuery({ queryKey: ['slides'] });
            }
            
            return [];
          }
          
          return [];
        }

        // Map database entries to slide objects with URLs
        const slidesWithUrls = (slideOrderData as DbSlideRecord[]).map((slide) => {
          const { data } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(`${SLIDES_FOLDER}/${slide.filename}`);

          return {
            id: slide.id,
            fileName: slide.filename, // Convert to our app's expected format
            order: slide.order,
            url: data.publicUrl
          };
        });

        return slidesWithUrls;
      } catch (error) {
        console.error('Error fetching slides:', error);
        toast({
          title: "Error",
          description: "Failed to load slides",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Upload slide files
  const uploadSlides = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadLoading(true);

    try {
      // Upload each file with timestamp and random number in filename
      const uploadPromises = Array.from(files).map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Error",
            description: `${file.name} is not an image file`,
            variant: "destructive",
          });
          return null;
        }

        // Generate filename with timestamp and random number
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 10000);
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const newFileName = `${timestamp}_${randomNum}.${fileExtension}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(`${SLIDES_FOLDER}/${newFileName}`, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) {
          console.error(`Upload error for ${file.name}:`, uploadError);
          throw new Error(uploadError.message);
        }

        // Get the public URL
        const { data } = supabase
          .storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(`${SLIDES_FOLDER}/${newFileName}`);
        
        return {
          fileName: newFileName,
          url: data.publicUrl
        };
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean) as { fileName: string, url: string }[];
      
      if (successfulUploads.length > 0) {
        // Get the current highest order number
        const currentSlides = slides || [];
        const highestOrder = currentSlides.length > 0 
          ? Math.max(...currentSlides.map(slide => slide.order)) 
          : -1;

        // Insert new slide order entries - convert fileName to filename for DB
        const newSlideEntries = successfulUploads.map((upload, index) => ({
          id: crypto.randomUUID(),
          filename: upload.fileName, // Note: lowercase 'n' to match DB schema
          order: highestOrder + 1 + index
        }));

        const { error: insertError } = await supabase
          .from('slide_order')
          .insert(newSlideEntries);

        if (insertError) {
          throw insertError;
        }

        await queryClient.invalidateQueries({ queryKey: ['slides'] });
        
        toast({
          title: "Success",
          description: `${successfulUploads.length} slides uploaded successfully`,
        });
      }
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

  // Delete a slide
  const deleteSlide = useMutation({
    mutationFn: async (slideId: string) => {
      // Find the slide to delete
      const slideToDelete = slides.find(slide => slide.id === slideId);
      if (!slideToDelete) throw new Error("Slide not found");

      // Delete from storage
      const { error: storageError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .remove([`${SLIDES_FOLDER}/${slideToDelete.fileName}`]);

      if (storageError) {
        throw storageError;
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('slide_order')
        .delete()
        .eq('id', slideId);

      if (dbError) {
        throw dbError;
      }

      // Update the order of remaining slides
      const remainingSlides = slides
        .filter(slide => slide.id !== slideId)
        .sort((a, b) => a.order - b.order);

      const updatePromises = remainingSlides.map((slide, index) => 
        supabase
          .from('slide_order')
          .update({ order: index })
          .eq('id', slide.id)
      );

      await Promise.all(updatePromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] });
      toast({
        title: "Success",
        description: "Slide deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting slide:', error);
      toast({
        title: "Error",
        description: `Failed to delete slide: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Move slide up in order
  const moveSlideUp = useMutation({
    mutationFn: async (slideId: string) => {
      const slideToMove = slides.find(slide => slide.id === slideId);
      if (!slideToMove) throw new Error("Slide not found");
      if (slideToMove.order === 0) return; // Already at the top

      // Find the slide that's directly above this one
      const slideBefore = slides.find(s => s.order === slideToMove.order - 1);
      if (!slideBefore) throw new Error("Cannot reorder slides");

      // Swap the order of the two slides
      const { error: error1 } = await supabase
        .from('slide_order')
        .update({ order: slideToMove.order - 1 })
        .eq('id', slideId);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from('slide_order')
        .update({ order: slideToMove.order })
        .eq('id', slideBefore.id);

      if (error2) throw error2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] });
    },
    onError: (error) => {
      console.error('Error moving slide up:', error);
      toast({
        title: "Error",
        description: `Failed to reorder slide: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Move slide down in order
  const moveSlideDown = useMutation({
    mutationFn: async (slideId: string) => {
      const slideToMove = slides.find(slide => slide.id === slideId);
      if (!slideToMove) throw new Error("Slide not found");
      if (slideToMove.order === slides.length - 1) return; // Already at the bottom

      // Find the slide that's directly below this one
      const slideAfter = slides.find(s => s.order === slideToMove.order + 1);
      if (!slideAfter) throw new Error("Cannot reorder slides");

      // Swap the order of the two slides
      const { error: error1 } = await supabase
        .from('slide_order')
        .update({ order: slideToMove.order + 1 })
        .eq('id', slideId);

      if (error1) throw error1;

      const { error: error2 } = await supabase
        .from('slide_order')
        .update({ order: slideToMove.order })
        .eq('id', slideAfter.id);

      if (error2) throw error2;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] });
    },
    onError: (error) => {
      console.error('Error moving slide down:', error);
      toast({
        title: "Error",
        description: `Failed to reorder slide: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Clear all slides
  const clearAllSlides = useMutation({
    mutationFn: async () => {
      if (!confirm("Are you sure you want to delete all slides? This action cannot be undone.")) {
        return;
      }

      // Get all slides
      const { data, error } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .list(SLIDES_FOLDER);

      if (error) throw error;

      if (data && data.length > 0) {
        // Create an array of file paths to delete
        const filesToDelete = data.map(file => `${SLIDES_FOLDER}/${file.name}`);
        
        // Delete all files
        const { error: deleteError } = await supabase
          .storage
          .from(STORAGE_BUCKET)
          .remove(filesToDelete);

        if (deleteError) throw deleteError;

        // Clear the slide_order table
        const { error: clearError } = await supabase
          .from('slide_order')
          .delete()
          .gte('id', '0'); // Delete all records

        if (clearError) throw clearError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slides'] });
      toast({
        title: "Success",
        description: "All slides have been deleted",
      });
    },
    onError: (error) => {
      console.error('Error deleting all slides:', error);
      toast({
        title: "Error",
        description: `Failed to delete slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  return {
    slides,
    slidesLoading,
    uploadSlides,
    uploadLoading,
    deleteSlide,
    moveSlideUp,
    moveSlideDown,
    clearAllSlides,
    refetchSlides
  };
};
