
import { Slide, LOCAL_STORAGE_ORDER_KEY, LOCAL_STORAGE_SLIDES_KEY } from '@/types/slideTypes';

// Store slides order in localStorage
export const saveSlidesOrder = async (slideNames: string[]): Promise<boolean> => {
  try {
    const orderData = {
      slides: slideNames,
      lastUpdated: Date.now()
    };
    
    localStorage.setItem(LOCAL_STORAGE_ORDER_KEY, JSON.stringify(orderData));
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
    const orderData = localStorage.getItem(LOCAL_STORAGE_ORDER_KEY);
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

// Save a slide to localStorage
export const saveSlideData = async (slide: Slide): Promise<boolean> => {
  try {
    // Get existing slides
    const existingData = localStorage.getItem(LOCAL_STORAGE_SLIDES_KEY);
    let slides: Record<string, Slide> = {};
    
    if (existingData) {
      slides = JSON.parse(existingData);
    }
    
    // Add or update the slide
    slides[slide.name] = slide;
    
    // Save back to localStorage
    localStorage.setItem(LOCAL_STORAGE_SLIDES_KEY, JSON.stringify(slides));
    console.log(`Saved slide ${slide.name} to localStorage`);
    return true;
  } catch (error) {
    console.error('Error saving slide data:', error);
    return false;
  }
};

// Get all slides data from localStorage
export const getAllSlidesData = async (): Promise<Record<string, Slide>> => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_SLIDES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Error getting slides data:', error);
    return {};
  }
};

// Get a single slide data by name
export const getSlideData = async (name: string): Promise<Slide | null> => {
  try {
    const allSlides = await getAllSlidesData();
    return allSlides[name] || null;
  } catch (error) {
    console.error(`Error getting slide data for ${name}:`, error);
    return null;
  }
};

// Delete a slide from localStorage
export const deleteSlideData = async (name: string): Promise<boolean> => {
  try {
    const allSlides = await getAllSlidesData();
    if (allSlides[name]) {
      delete allSlides[name];
      localStorage.setItem(LOCAL_STORAGE_SLIDES_KEY, JSON.stringify(allSlides));
      
      // Also revoke blob URL if it exists
      const slide = allSlides[name];
      if (slide && slide.url.startsWith('blob:')) {
        URL.revokeObjectURL(slide.url);
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error deleting slide data for ${name}:`, error);
    return false;
  }
};

// Clear all slides data
export const clearAllSlidesData = async (): Promise<boolean> => {
  try {
    // First revoke all blob URLs
    const allSlides = await getAllSlidesData();
    Object.values(allSlides).forEach(slide => {
      if (slide.url.startsWith('blob:')) {
        URL.revokeObjectURL(slide.url);
      }
    });
    
    // Clear localStorage
    localStorage.removeItem(LOCAL_STORAGE_SLIDES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing all slides data:', error);
    return false;
  }
};

// Generate a URL for a slide
export const getPublicUrl = (filename: string, timestamp: number): string => {
  return `/slides/${filename}?t=${timestamp}`;
};

// Get blob URL for a slide if available, otherwise return public URL
export const getSlideUrl = async (filename: string, timestamp: number): Promise<string> => {
  const slide = await getSlideData(filename);
  if (slide && slide.url.startsWith('blob:')) {
    return slide.url;
  }
  
  // Fall back to public URL
  return getPublicUrl(filename, timestamp);
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

// Process file upload
export const processFileUpload = async (file: File): Promise<Slide | null> => {
  try {
    if (!file.type.startsWith('image/')) {
      console.error(`${file.name} is not an image file`);
      return null;
    }
    
    // Generate a unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const newFileName = generateUniqueFileName(fileExtension);
    
    // Create a blob URL for preview
    const blobUrl = createBlobUrl(file);
    
    // Create slide object
    const slide: Slide = {
      name: newFileName,
      url: blobUrl,
      originalName: file.name
    };
    
    // Save slide data to localStorage
    await saveSlideData(slide);
    
    // Download functionality to help users save files locally
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = newFileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    return slide;
  } catch (error) {
    console.error('Error processing file upload:', error);
    return null;
  }
};

// Download all slides as a ZIP file
export const downloadAllSlides = async (): Promise<boolean> => {
  try {
    // For this to work, we need to load the JSZip library
    const JSZip = (window as any).JSZip || await import('jszip').then(m => m.default);
    
    const allSlides = await getAllSlidesData();
    const zip = new JSZip();
    
    // Add all slides to the ZIP file
    const fetchPromises = Object.values(allSlides).map(async slide => {
      try {
        const response = await fetch(slide.url);
        const blob = await response.blob();
        zip.file(slide.name, blob);
      } catch (err) {
        console.error(`Failed to add ${slide.name} to ZIP:`, err);
      }
    });
    
    await Promise.all(fetchPromises);
    
    // Generate the ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Create download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(zipBlob);
    downloadLink.download = 'investor_slides.zip';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up
    URL.revokeObjectURL(downloadLink.href);
    
    return true;
  } catch (error) {
    console.error('Error downloading all slides:', error);
    return false;
  }
};
