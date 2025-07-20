
import { useState, useEffect, useRef } from 'react';

interface UseImageInViewportOptions {
  threshold?: number;
  delay?: number;
}

export const useImageInViewport = (options: UseImageInViewportOptions = {}) => {
  const { threshold = 1.0, delay = 500 } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShowAnimation, setShouldShowAnimation] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const animationTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Intersection Observer to detect when element is fully visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.intersectionRatio >= threshold);
      },
      { threshold }
    );

    observer.observe(element);

    // Function to handle scroll events
    const handleScroll = () => {
      setShouldShowAnimation(false);
      
      // Clear existing timeouts
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }

      // Set a timeout to detect when scrolling has stopped
      scrollTimeoutRef.current = setTimeout(() => {
        if (isVisible) {
          // Start animation delay after scrolling stops
          animationTimeoutRef.current = setTimeout(() => {
            setShouldShowAnimation(true);
          }, delay);
        }
      }, 150); // Wait 150ms after scroll stops
    };

    // Listen to both window scroll and potential carousel scroll
    window.addEventListener('scroll', handleScroll);
    element.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      element.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, [isVisible, threshold, delay]);

  // Reset animation when not visible
  useEffect(() => {
    if (!isVisible) {
      setShouldShowAnimation(false);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    }
  }, [isVisible]);

  return { elementRef, shouldShowAnimation };
};
