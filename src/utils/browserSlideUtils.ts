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

// Generate a URL for a slide - ensure it's in the /slides folder
export const getPublicUrl = (filename: string, timestamp: number): string => {
  // First try to get from localStorage
  const storedUrl = localStorage.getItem(`slide_${filename}`);
  if (storedUrl) {
    // Store blob URLs as-is
    if (storedUrl.startsWith('blob:')) {
      return storedUrl;
    }
    
    // Otherwise ensure the path has the right format
    return `/${SLIDES_FOLDER}/${filename}?t=${timestamp}`;
  }
  
  // If not found in localStorage, use a fallback path with correct folder
  return `/${SLIDES_FOLDER}/${filename}?t=${timestamp}`;
};

// Generate a unique filename
export const generateUniqueFileName = (fileExtension: string): string => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 100000);
  return `${timestamp}_${randomId}.${fileExtension}`;
};
