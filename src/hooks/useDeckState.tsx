
import { useState, useEffect } from 'react';
import { Slide, SlideState } from '@/types/slide';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

// API endpoints
const API_ENDPOINTS = {
  UPLOAD: '/api/upload-slide.php',
  UPDATE_ORDER: '/api/update-slides-order.php',
  GET_SLIDES: '/api/get-slides.php',
  DELETE_SLIDE: '/api/delete-slide.php'
};

export function useDeckState(): {
  state: SlideState;
  addSlides: (files: File[]) => void;
  removeSlide: (id: string) => void;
  moveSlideUp: (id: string) => void;
  moveSlideDown: (id: string) => void;
  goToNextSlide: () => void;
  goToPrevSlide: () => void;
  goToSlide: (index: number) => void;
} {
  const [state, setState] = useState<SlideState>({
    slides: [],
    currentSlideIndex: 0,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load slides from server on initial render
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.GET_SLIDES);
        if (!response.ok) {
          throw new Error(`Failed to fetch slides: HTTP ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(`Server error: ${data.error}${data.details ? ` - ${JSON.stringify(data.details)}` : ''}`);
        }
        
        if (data.slides && Array.isArray(data.slides)) {
          setState(prevState => ({
            ...prevState,
            slides: data.slides.map((slide: any, index: number) => ({
              id: slide.id || uuidv4(),
              imageUrl: slide.serverPath,
              serverPath: slide.serverPath,
              file: null,
              order: slide.order !== undefined ? slide.order : index
            })).sort((a: Slide, b: Slide) => a.order - b.order)
          }));
        }
      } catch (error) {
        console.error('Error fetching slides:', error);
        toast({
          title: "Error fetching slides",
          description: `${error instanceof Error ? error.message : 'Unknown error'}\nFalling back to localStorage.`,
          variant: "destructive"
        });
        
        // Fall back to localStorage if server request fails
        const savedSlides = localStorage.getItem('deck_slides');
        if (savedSlides) {
          try {
            const parsedSlides = JSON.parse(savedSlides);
            setState(prevState => ({
              ...prevState,
              slides: parsedSlides.map((slide: any) => ({
                ...slide,
                file: null
              }))
            }));
          } catch (parseError) {
            console.error('Failed to parse saved slides:', parseError);
            toast({
              title: "Failed to load slides",
              description: `Error parsing saved slides: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
              variant: "destructive"
            });
          }
        }
      } finally {
        setIsInitialized(true);
      }
    };
    
    fetchSlides();
  }, []);

  // Save slides to server whenever they change
  useEffect(() => {
    if (!isInitialized) return;
    
    const saveSlides = async () => {
      try {
        const slidesToSave = state.slides.map(slide => ({
          id: slide.id,
          serverPath: slide.serverPath || slide.imageUrl,
          order: slide.order
        }));
        
        const response = await fetch(API_ENDPOINTS.UPDATE_ORDER, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ slides: slidesToSave }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update slides order: HTTP ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(`Server error: ${data.error}${data.details ? ` - ${JSON.stringify(data.details)}` : ''}`);
        }
      } catch (error) {
        console.error('Error saving slides order:', error);
        toast({
          title: "Failed to save slide order",
          description: `${error instanceof Error ? error.message : 'Unknown error'}\nFalling back to localStorage.`,
          variant: "destructive"
        });
        
        // Fall back to localStorage
        const slidesToSave = state.slides.map(slide => ({
          id: slide.id,
          imageUrl: slide.imageUrl,
          serverPath: slide.serverPath,
          order: slide.order
        }));
        localStorage.setItem('deck_slides', JSON.stringify(slidesToSave));
      }
    };
    
    saveSlides();
  }, [state.slides, isInitialized]);

  // Add new slides
  const addSlides = async (files: File[]) => {
    // First, create temporary slides with local URLs for immediate display
    const tempSlides = Array.from(files).map((file, index) => {
      const localImageUrl = URL.createObjectURL(file);
      return {
        id: uuidv4(),
        file,
        imageUrl: localImageUrl,
        order: state.slides.length + index
      };
    });
    
    // Update state with temporary slides
    setState(prevState => ({
      ...prevState,
      slides: [...prevState.slides, ...tempSlides].sort((a, b) => a.order - b.order)
    }));
    
    // Upload each file to the server
    const uploadPromises = tempSlides.map(async (slide, index) => {
      if (!slide.file) return null;
      
      const formData = new FormData();
      formData.append('slide', slide.file);
      
      try {
        const response = await fetch(API_ENDPOINTS.UPLOAD, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to upload slide ${index + 1}: HTTP ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.error) {
          throw new Error(`Server error on slide ${index + 1}: ${data.error}${data.details ? ` - ${JSON.stringify(data.details)}` : ''}`);
        }
        
        if (!data.success) {
          throw new Error(`Failed to upload slide ${index + 1}: ${data.error || 'Unknown server error'}`);
        }
        
        return {
          id: slide.id,
          serverPath: data.filePath,
          order: slide.order
        };
      } catch (error) {
        console.error(`Error uploading slide ${index + 1}:`, error);
        toast({
          title: `Error uploading slide ${index + 1}`,
          description: `${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive"
        });
        return null;
      }
    });
    
    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(Boolean);
    const failedUploads = files.length - successfulUploads.length;
    
    if (successfulUploads.length > 0) {
      // Update state with server paths
      setState(prevState => {
        const updatedSlides = prevState.slides.map(slide => {
          const uploadResult = successfulUploads.find(result => result?.id === slide.id);
          if (uploadResult) {
            return {
              ...slide,
              serverPath: uploadResult.serverPath,
              imageUrl: uploadResult.serverPath // Update imageUrl to use server path
            };
          }
          return slide;
        });
        
        return {
          ...prevState,
          slides: updatedSlides
        };
      });
      
      if (failedUploads > 0) {
        toast({
          title: "Partial upload success",
          description: `${successfulUploads.length} of ${files.length} slides uploaded successfully. ${failedUploads} failed.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: `${successfulUploads.length} slides uploaded successfully.`,
        });
      }
    } else if (files.length > 0) {
      toast({
        title: "Upload failed",
        description: "Failed to upload slides to server. Using local storage as fallback. Check console for details.",
        variant: "destructive"
      });
    }
  };

  // Remove a slide
  const removeSlide = async (id: string) => {
    const slideToRemove = state.slides.find(slide => slide.id === id);
    
    if (slideToRemove?.serverPath) {
      try {
        // Delete from server first
        const response = await fetch(API_ENDPOINTS.DELETE_SLIDE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filePath: slideToRemove.serverPath }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to delete slide from server: HTTP ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(`Server error deleting slide: ${data.error}${data.details ? ` - ${JSON.stringify(data.details)}` : ''}`);
        }
      } catch (error) {
        console.error('Error deleting slide:', error);
        toast({
          title: "Warning",
          description: `Could not delete slide from server: ${error instanceof Error ? error.message : 'Unknown error'}\nSlide was removed from local display only.`,
          variant: "destructive"
        });
      }
    }
    
    // Remove from state regardless of server success
    setState(prevState => {
      const filteredSlides = prevState.slides.filter(slide => slide.id !== id);
      // Reorder the remaining slides
      const reorderedSlides = filteredSlides.map((slide, index) => ({
        ...slide,
        order: index
      }));
      
      // Adjust current slide index if needed
      let newIndex = prevState.currentSlideIndex;
      if (newIndex >= reorderedSlides.length && reorderedSlides.length > 0) {
        newIndex = reorderedSlides.length - 1;
      }
      
      return {
        slides: reorderedSlides,
        currentSlideIndex: newIndex
      };
    });
  };

  // Move a slide up in order
  const moveSlideUp = (id: string) => {
    setState(prevState => {
      const slides = [...prevState.slides];
      const index = slides.findIndex(slide => slide.id === id);
      
      if (index <= 0) return prevState; // Already at the top
      
      // Swap with the previous slide
      const temp = slides[index].order;
      slides[index].order = slides[index - 1].order;
      slides[index - 1].order = temp;
      
      return {
        ...prevState,
        slides: slides.sort((a, b) => a.order - b.order)
      };
    });
  };

  // Move a slide down in order
  const moveSlideDown = (id: string) => {
    setState(prevState => {
      const slides = [...prevState.slides];
      const index = slides.findIndex(slide => slide.id === id);
      
      if (index >= slides.length - 1 || index === -1) return prevState; // Already at the bottom
      
      // Swap with the next slide
      const temp = slides[index].order;
      slides[index].order = slides[index + 1].order;
      slides[index + 1].order = temp;
      
      return {
        ...prevState,
        slides: slides.sort((a, b) => a.order - b.order)
      };
    });
  };

  // Navigation functions
  const goToNextSlide = () => {
    setState(prevState => {
      if (prevState.currentSlideIndex < prevState.slides.length - 1) {
        return {
          ...prevState,
          currentSlideIndex: prevState.currentSlideIndex + 1
        };
      }
      return prevState;
    });
  };

  const goToPrevSlide = () => {
    setState(prevState => {
      if (prevState.currentSlideIndex > 0) {
        return {
          ...prevState,
          currentSlideIndex: prevState.currentSlideIndex - 1
        };
      }
      return prevState;
    });
  };

  const goToSlide = (index: number) => {
    setState(prevState => {
      if (index >= 0 && index < prevState.slides.length) {
        return {
          ...prevState,
          currentSlideIndex: index
        };
      }
      return prevState;
    });
  };

  return {
    state,
    addSlides,
    removeSlide,
    moveSlideUp,
    moveSlideDown,
    goToNextSlide,
    goToPrevSlide,
    goToSlide
  };
}
