
import { Slide, SLIDES_FOLDER, STORAGE_BUCKET } from '@/types/slideTypes';
import { supabase } from '@/integrations/supabase/client';

// Store slides order in localStorage
export const saveSlidesOrder = async (slideNames: string[]): Promise<boolean> => {
  try {
    const orderData = {
      slides: slideNames,
      lastUpdated: Date.now()
    };
    
    localStorage.setItem('investor_slides_order', JSON.stringify(orderData));
    
    // Also save to Supabase storage for server-side persistence
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`${SLIDES_FOLDER}/slides_order.json`, 
        JSON.stringify(orderData),
        { 
          contentType: 'application/json',
          upsert: true,
          cacheControl: '0'
        }
      );
    
    if (error) {
      console.error('Error saving order to Supabase:', error);
      // We still saved to localStorage, so return true
    }
    
    console.log('Saved slides order to localStorage and Supabase:', orderData);
    return true;
  } catch (error) {
    console.error('Error saving slides order:', error);
    return false;
  }
};

// Get slides order from localStorage and fallback to Supabase storage
export const getSlidesOrder = async (): Promise<string[]> => {
  try {
    // First try localStorage
    const orderData = localStorage.getItem('investor_slides_order');
    if (orderData) {
      const parsed = JSON.parse(orderData);
      console.log('Retrieved slides order from localStorage:', parsed.slides);
      return parsed.slides;
    }
    
    // If not in localStorage, try Supabase storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(`${SLIDES_FOLDER}/slides_order.json`);
    
    if (error || !data) {
      console.log('No slides order found in Supabase storage');
      return [];
    }
    
    const text = await data.text();
    const parsed = JSON.parse(text);
    console.log('Retrieved slides order from Supabase:', parsed.slides);
    
    // Save to localStorage for faster access next time
    localStorage.setItem('investor_slides_order', text);
    
    return parsed.slides;
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
  }
  
  // Get from Supabase storage
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(`${SLIDES_FOLDER}/${filename}`);
    
  return `${data.publicUrl}?t=${timestamp}`;
};

// Generate a unique filename
export const generateUniqueFileName = (fileExtension: string): string => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 100000);
  return `${timestamp}_${randomId}.${fileExtension}`;
};
