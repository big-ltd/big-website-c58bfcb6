
// This is now a browser-compatible mock of file system operations
// It uses localStorage instead of actual file system

import { SLIDES_FOLDER, SLIDES_ORDER_FILE } from '@/types/slideTypes';

// Constants - no longer using actual file paths
export const getSlidesFolder = (): string => {
  return SLIDES_FOLDER;
};

// Generate a unique filename
export const generateUniqueFileName = (fileExtension: string): string => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 100000);
  return `${timestamp}_${randomId}.${fileExtension}`;
};

// Get public URL for a file
export const getPublicUrl = (filename: string, timestamp: number): string => {
  // First try to get from localStorage
  const storedUrl = localStorage.getItem(`slide_${filename}`);
  if (storedUrl) {
    return storedUrl;
  }
  
  // If not found in localStorage, use a fallback path
  return `/${SLIDES_FOLDER}/${filename}?t=${timestamp}`;
};

// Save slides order to localStorage
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
    console.log('No slides order found in localStorage, returning empty array');
    return [];
  } catch (error) {
    console.error('Error getting slides order:', error);
    return [];
  }
};

// These functions are mocked to work in the browser
export const ensureDir = async (): Promise<boolean> => {
  return true;
};

export const listFiles = async (): Promise<string[]> => {
  return []; // In browser context, we can't list files directly
};
