
import { supabase } from '@/integrations/supabase/client';
import { STORAGE_BUCKET, SLIDES_FOLDER, SLIDES_ORDER_FILE, SlidesOrder } from '@/types/slideTypes';

// Create slides folder if it doesn't exist
export const ensureSlidesFolderExists = async (): Promise<boolean> => {
  try {
    // Try to list the slides folder to see if it exists
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(SLIDES_FOLDER);
    
    if (error) {
      console.log('Creating slides folder...');
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(`${SLIDES_FOLDER}/.folder`, new Blob([''], { type: 'text/plain' }), {
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error creating slides folder:', uploadError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring slides folder exists:', error);
    return false;
  }
};

export const fetchSlidesOrder = async (): Promise<SlidesOrder | null> => {
  try {
    // Make sure slides folder exists before trying to fetch order file
    const folderExists = await ensureSlidesFolderExists();
    if (!folderExists) {
      return null;
    }
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(`${SLIDES_FOLDER}/${SLIDES_ORDER_FILE}`);
    
    if (error) {
      console.log('No slides order file found, will create one');
      return null;
    }
    
    const text = await data.text();
    console.log('Fetched slides order:', text);
    return JSON.parse(text) as SlidesOrder;
  } catch (error) {
    console.error('Error fetching slides order:', error);
    return null;
  }
};

export const saveSlidesOrder = async (slideNames: string[]): Promise<boolean> => {
  try {
    // Ensure we have a valid array
    if (!slideNames || !Array.isArray(slideNames)) {
      console.error('Invalid slides order array:', slideNames);
      throw new Error('Invalid slides order array');
    }
    
    const orderData: SlidesOrder = {
      slides: slideNames,
      lastUpdated: Date.now()
    };
    
    console.log('Saving slides order:', JSON.stringify(orderData, null, 2));
    
    // Wait for the upload to complete
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(`${SLIDES_FOLDER}/${SLIDES_ORDER_FILE}`, 
        JSON.stringify(orderData, null, 2),
        { 
          contentType: 'application/json',
          upsert: true,
          cacheControl: '0'
        }
      );
    
    if (error) {
      console.error('Error saving slides order:', error);
      throw error;
    }
    
    console.log('Slides order saved successfully');
    
    // Verify the order was saved correctly
    const verifyOrder = await fetchSlidesOrder();
    console.log('Verification - New slides order after save:', verifyOrder);
    
    return true;
  } catch (error) {
    console.error('Error saving slides order:', error);
    return false;
  }
};

export const generateUniqueFileName = (fileExtension: string): string => {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 100000);
  return `${timestamp}_${randomId}.${fileExtension}`;
};

export const verifyFileExists = async (path: string): Promise<boolean> => {
  try {
    // Try to get the file's public URL
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(`${path}`);
    
    // Try to check if the file exists with a HEAD request
    try {
      const response = await fetch(data.publicUrl, { method: 'HEAD' });
      return response.ok;
    } catch (fetchError) {
      console.error(`Fetch error for ${path}:`, fetchError);
      return false;
    }
  } catch (error) {
    console.error(`File verification failed for ${path}:`, error);
    return false;
  }
};

export const getPublicUrl = (filePath: string, timestamp: number): string => {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);
  
  return `${data.publicUrl}?t=${timestamp}`;
};
