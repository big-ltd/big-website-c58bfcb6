
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
    // Try localStorage
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

// Generate a URL for a slide - ensure it's in the public slides folder
export const getPublicUrl = (filename: string, timestamp: number): string => {
  // First try to get from localStorage (for blob URLs)
  const storedUrl = localStorage.getItem(`slide_${filename}`);
  if (storedUrl && storedUrl.startsWith('blob:')) {
    return storedUrl;
  }
  
  // Return a direct URL to the file in the public folder
  return `/slides/${filename}?t=${timestamp}`;
};

// Generate a unique filename
export const generateUniqueFileName = (fileExtension: string): string => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 100000);
  return `${timestamp}_${randomId}.${fileExtension}`;
};

// Convert file to blob URL for preview
export const createBlobUrl = (file: File): string => {
  return URL.createObjectURL(file);
};

// Save a file to localStorage as a blob URL for temporary use
export const saveBlobUrl = (filename: string, blobUrl: string): void => {
  localStorage.setItem(`slide_${filename}`, blobUrl);
};
