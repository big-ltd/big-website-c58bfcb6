import { useState, useEffect } from 'react';
import { Slide, SlideState } from '@/types/slide';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

// Server-side API endpoints (these would be actual API endpoints in a real implementation)
const API_URL = '/api/slides';

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

  // Load slides from server on initial render
  useEffect(() => {
    // For now, we'll keep using localStorage as a fallback
    // In a real implementation, this would be an API call to fetch slides from the server
    const savedSlides = localStorage.getItem('deck_slides');
    if (savedSlides) {
      try {
        const parsedSlides = JSON.parse(savedSlides);
        setState(prevState => ({
          ...prevState,
          slides: parsedSlides.map((slide: any) => ({
            ...slide,
            file: null // Files can't be stored in localStorage
          }))
        }));
      } catch (error) {
        console.error('Failed to parse saved slides:', error);
      }
    }
  }, []);

  // Save slides whenever they change
  useEffect(() => {
    // In a real implementation, we wouldn't need this as data would be saved to the server
    // This is just for demonstration purposes
    const slidesToSave = state.slides.map(slide => ({
      id: slide.id,
      imageUrl: slide.imageUrl,
      order: slide.order
    }));
    localStorage.setItem('deck_slides', JSON.stringify(slidesToSave));
  }, [state.slides]);

  // Add new slides
  const addSlides = (files: File[]) => {
    const newSlides = Array.from(files).map((file, index) => {
      const imageUrl = URL.createObjectURL(file);
      return {
        id: uuidv4(),
        file,
        imageUrl,
        order: state.slides.length + index
      };
    });

    // In a real implementation, this would upload the files to the server
    // and then update the state with the server response
    // For now, we'll just update the local state
    
    setState(prevState => ({
      ...prevState,
      slides: [...prevState.slides, ...newSlides].sort((a, b) => a.order - b.order)
    }));

    // Mock successful upload toast
    toast({
      title: "Success",
      description: `${files.length} slides uploaded successfully.`,
    });
  };

  // Remove a slide
  const removeSlide = (id: string) => {
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
