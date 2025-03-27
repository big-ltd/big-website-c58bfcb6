
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

const STORAGE_BUCKET = "investor_docs";
const SLIDES_FOLDER = "slides";

interface Slide {
  url: string;
  name: string;
}

export const useSlideManagement = () => {
  const [currentSlides, setCurrentSlides] = useState<Slide[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(Date.now());
  const { toast } = useToast();

  const checkCurrentSlides = async (forceTimestamp = null) => {
    try {
      const timestamp = forceTimestamp || Date.now();
      setCacheTimestamp(timestamp);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data, error } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .list(`${SLIDES_FOLDER}/`, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const imageFiles = data.filter(file => 
          file.name.toLowerCase().endsWith('.jpg') || 
          file.name.toLowerCase().endsWith('.jpeg') || 
          file.name.toLowerCase().endsWith('.png')
        );
        
        imageFiles.sort((a, b) => {
          const nameA = a.name;
          const nameB = b.name;
          return nameA.localeCompare(nameB, undefined, { numeric: true });
        });
        
        console.log('Fetched slides from storage:', imageFiles.map(f => f.name));
        
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
        console.log('Slides refreshed from storage.');
      } else {
        setCurrentSlides([]);
      }
    } catch (error) {
      console.error('Error checking current slides:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadLoading(true);

    try {
      const { data: existingFiles, error: listError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .list(`${SLIDES_FOLDER}/`, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (listError) {
        throw listError;
      }
      
      const existingImageFiles = existingFiles ? existingFiles.filter(file => 
        file.name.toLowerCase().endsWith('.jpg') || 
        file.name.toLowerCase().endsWith('.jpeg') || 
        file.name.toLowerCase().endsWith('.png')
      ) : [];
      
      let nextSlideNumber = 1;
      
      if (existingImageFiles.length > 0) {
        const fileNumbers = existingImageFiles.map(file => {
          const nameMatch = file.name.match(/^(\d+)\./);
          return nameMatch ? parseInt(nameMatch[1], 10) : 0;
        });
        
        nextSlideNumber = Math.max(...fileNumbers) + 1;
      }
      
      const uploadPromises = Array.from(files).map(async (file, index) => {
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Error",
            description: `${file.name} is not an image file`,
            variant: "destructive",
          });
          return null;
        }

        const fileNumber = String(nextSlideNumber + index).padStart(2, '0');
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const newFileName = `${fileNumber}.${fileExtension}`;

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
        
        return {
          url: `${data.publicUrl}?t=${cacheTimestamp}`,
          name: newFileName
        };
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean);
      
      if (successfulUploads.length > 0) {
        setCacheTimestamp(Date.now());
        await checkCurrentSlides();
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
        const filesToDelete = data.map(file => `${SLIDES_FOLDER}/${file.name}`);
        
        const { error: deleteError } = await supabase
          .storage
          .from(STORAGE_BUCKET)
          .remove(filesToDelete);

        if (deleteError) {
          throw deleteError;
        }

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
      const slideToDelete = currentSlides[slideIndex];
      const slideFileName = slideToDelete.name.split('?')[0];
      
      const { error: deleteError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .remove([`${SLIDES_FOLDER}/${slideFileName}`]);
      
      if (deleteError) {
        throw deleteError;
      }
      
      const updatedSlides = currentSlides.filter((_, index) => index !== slideIndex);
      
      if (updatedSlides.length > 0) {
        const slidesToRenumber = [...updatedSlides];
        
        const downloadPromises = slidesToRenumber.map(async (slide, index) => {
          const slideName = slide.name.split('?')[0];
          const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .download(`${SLIDES_FOLDER}/${slideName}`);
          
          if (error) {
            throw error;
          }
          
          return {
            file: data,
            originalName: slideName
          };
        });
        
        const slidesWithFiles = await Promise.all(downloadPromises);
        
        const filesToDelete = slidesWithFiles.map(slide => `${SLIDES_FOLDER}/${slide.originalName}`);
        await supabase.storage.from(STORAGE_BUCKET).remove(filesToDelete);
        
        const uploadPromises = slidesWithFiles.map(async (slide, index) => {
          const fileNumber = String(index + 1).padStart(2, '0');
          const fileExtension = slide.originalName.split('.').pop() || 'jpg';
          const newFileName = `${fileNumber}.${fileExtension}`;
          
          const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(`${SLIDES_FOLDER}/${newFileName}`, slide.file, {
              cacheControl: '0',
              upsert: true
            });
          
          if (error) {
            throw error;
          }
        });
        
        await Promise.all(uploadPromises);
      }
      
      setCacheTimestamp(Date.now());
      
      await checkCurrentSlides();
      
      toast({
        title: "Success",
        description: "Slide deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting slide:', error);
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
    
    setUploadLoading(true);
    
    try {
      console.log('===== DEBUG SLIDE REORDERING =====');
      console.log(`Starting move from ${sourceIndex} to ${destinationIndex}`);
      
      const slidesArray = [...currentSlides];
      
      console.log('Current slides before move:');
      slidesArray.forEach((slide, idx) => {
        console.log(`${idx}: ${slide.name}`);
      });
      
      const slideToMove = slidesArray[sourceIndex];
      console.log(`Moving slide: ${slideToMove.name}`);
      console.log(`Moving slide from index ${sourceIndex} to ${destinationIndex}`);
      
      slidesArray.splice(sourceIndex, 1);
      console.log('After splice removal:');
      slidesArray.forEach((slide, idx) => {
        console.log(`${idx}: ${slide.name}`);
      });
      
      slidesArray.splice(destinationIndex, 0, slideToMove);
      console.log('After splice insertion:');
      slidesArray.forEach((slide, idx) => {
        console.log(`${idx}: ${slide.name}`);
      });
      
      console.log('Updated order:');
      slidesArray.forEach((slide, idx) => {
        console.log(`${idx}: ${slide.name}`);
      });
      
      const renamedSlides = slidesArray.map((slide, index) => {
        const fileNumber = String(index + 1).padStart(2, '0');
        const fileExtension = slide.name.split('.').pop()?.split('?')[0] || 'jpg';
        const newName = `${fileNumber}.${fileExtension}`;
        
        console.log(`Slide ${index} - Original: ${slide.name}, New: ${newName}`);
        
        return {
          originalSlide: slide,
          newName,
          originalName: slide.name
        };
      });
      
      console.log('Renamed slides:', renamedSlides.map(s => `${s.originalName} → ${s.newName}`));
      console.log('Starting downloads...');
      
      const downloadPromises = renamedSlides.map(async (slide) => {
        console.log(`Starting download for slide ${slide.originalName}`);
        
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .download(`${SLIDES_FOLDER}/${slide.originalName}`);
        
        if (error) {
          console.error(`Error downloading "${slide.originalName}":`, error);
          throw error;
        }
        
        console.log(`Successfully downloaded slide ${slide.originalName}`);
        
        return {
          ...slide,
          file: data
        };
      });
      
      const slidesWithFiles = await Promise.all(downloadPromises);
      console.log('All downloads completed.');
      
      const filesToDelete = slidesWithFiles.map(slide => `${SLIDES_FOLDER}/${slide.originalName}`);
      console.log('Files to delete:', filesToDelete);
      
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(filesToDelete);
      
      if (deleteError) {
        console.error('Error deleting files:', deleteError);
        throw deleteError;
      }
      
      console.log('Successfully deleted old files. Starting uploads...');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const uploadPromises = slidesWithFiles.map(async (slide, index) => {
        console.log(`Uploading ${index}: ${slide.newName}`);
        
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(`${SLIDES_FOLDER}/${slide.newName}`, slide.file, {
            cacheControl: '0',
            upsert: true
          });
        
        if (error) {
          console.error(`Error uploading "${slide.newName}":`, error);
          throw error;
        }
        
        console.log(`Successfully uploaded ${slide.newName}`);
      });
      
      await Promise.all(uploadPromises);
      console.log('All uploads completed successfully.');
      
      const newTimestamp = Date.now();
      setCacheTimestamp(newTimestamp);
      console.log('Cache timestamp updated:', newTimestamp);
      
      // Update UI state immediately
      const updatedSlides = renamedSlides.map(slide => {
        const { data } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(`${SLIDES_FOLDER}/${slide.newName}`);
        
        return {
          url: `${data.publicUrl}?t=${newTimestamp}`,
          name: slide.newName
        };
      });
      
      setCurrentSlides(updatedSlides);
      
      // Now refresh from storage to ensure consistency
      await new Promise(resolve => setTimeout(resolve, 2000));
      await checkCurrentSlides(newTimestamp);
      
      toast({
        title: "Success",
        description: "Slides reordered successfully",
      });
    } catch (error) {
      console.error('===== ERROR REORDERING SLIDES =====');
      console.error('Error details:', error);
      
      toast({
        title: "Error",
        description: `Failed to reorder slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      
      await checkCurrentSlides();
    } finally {
      setUploadLoading(false);
      console.log('===== END SLIDE REORDERING =====');
    }
  };

  const handleRefreshCache = async () => {
    setUploadLoading(true);
    try {
      setCacheTimestamp(Date.now());
      await checkCurrentSlides();
      
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

  return {
    currentSlides,
    uploadLoading,
    checkCurrentSlides,
    handleFileUpload,
    handleClearAllSlides,
    handleDeleteSlide,
    handleMoveSlide,
    handleRefreshCache
  };
};
