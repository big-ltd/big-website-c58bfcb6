
import { Slide, SLIDES_FOLDER } from '@/types/slideTypes';

// Store slides order in localStorage
export const saveSlidesOrder = async (slideNames: string[]): Promise<boolean> => {
  try {
    const orderData = {
      slides: slideNames,
      lastUpdated: Date.now()
    };
    
    localStorage.setItem('investor_slides_order', JSON.stringify(orderData));
    console.log('Saved slides order to localStorage:', orderData);
    return true;
  } catch (error) {
    console.error('Error saving slides order:', error);
    return false;
  }
};

// Get slides order from localStorage
export const getSlidesOrder = async (): Promise<string[]> => {
  try {
    const orderData = localStorage.getItem('investor_slides_order');
    if (orderData) {
      const parsed = JSON.parse(orderData);
      console.log('Retrieved slides order from localStorage:', parsed.slides);
      return parsed.slides;
    }
    return [];
  } catch (error) {
    console.error('Error getting slides order:', error);
    return [];
  }
};

// Generate a URL for a slide
export const getPublicUrl = (filename: string, timestamp: number): string => {
  // For uploaded files, we'll use the actual file paths
  if (filename.includes('://') || filename.startsWith('/')) {
    return `${filename}?t=${timestamp}`;
  }
  return `/${SLIDES_FOLDER}/${filename}?t=${timestamp}`;
};

// Generate a unique filename
export const generateUniqueFileName = (fileExtension: string): string => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 100000);
  return `${timestamp}_${randomId}.${fileExtension}`;
};
