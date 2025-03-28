import { Slide } from '@/types/slideTypes';

// API endpoint for slide operations
const SLIDES_API_ENDPOINT = '/api/slides';

// Upload files to the server
export const uploadSlidesToServer = async (files: FileList): Promise<Slide[]> => {
  const formData = new FormData();
  
  Array.from(files).forEach(file => {
    formData.append('slides', file);
  });
  
  console.log(`Uploading ${files.length} files to server...`);
  
  try {
    const response = await fetch(`${SLIDES_API_ENDPOINT}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // Use text as is if not JSON
        if (errorText) {
          errorMessage += ` - ${errorText.substring(0, 100)}`;
        }
      }
      
      throw new Error(`Failed to upload slides: ${errorMessage}`);
    }
    
    // Check content type to ensure we're getting JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`Warning: Expected JSON response but got ${contentType}`);
    }
    
    // Get the response as text first to debug if needed
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (!responseText || responseText.trim() === '') {
      console.warn('Empty response from server');
      return [];
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('Upload response parsed:', data);
      return data;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError, 'Raw response:', responseText);
      throw new Error(`Invalid JSON response from server: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error during upload:', error);
    throw error;
  }
};

// Fetch slides from the server
export const fetchSlidesFromServer = async (): Promise<Slide[]> => {
  console.log('Fetching slides from server...');
  
  try {
    const response = await fetch(`${SLIDES_API_ENDPOINT}/list`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server error response:', errorText);
      
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // Use text as is if not JSON
        if (errorText) {
          errorMessage += ` - ${errorText.substring(0, 100)}`;
        }
      }
      
      throw new Error(`Failed to fetch slides: ${errorMessage}`);
    }
    
    // Check content type to ensure we're getting JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`Warning: Expected JSON response but got ${contentType}`);
    }
    
    // Get the response as text first to debug if needed
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (!responseText || responseText.trim() === '') {
      console.warn('Empty response from server');
      return [];
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('Fetched slides parsed:', data);
      return data;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError, 'Raw response:', responseText);
      throw new Error(`Invalid JSON response from server: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error fetching slides:', error);
    throw error;
  }
};

// Delete all slides from the server
export const clearAllSlidesFromServer = async (): Promise<void> => {
  console.log('Clearing all slides from server...');
  
  try {
    const response = await fetch(`${SLIDES_API_ENDPOINT}/clear`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Server error response:', responseText);
      try {
        // Try to parse as JSON first
        const errorData = JSON.parse(responseText);
        throw new Error(`Failed to clear slides: ${errorData.error || response.status} ${response.statusText}`);
      } catch (parseError) {
        // If parsing fails, use the raw text
        throw new Error(`Failed to clear slides: ${response.status} ${response.statusText} - ${responseText.substring(0, 100)}`);
      }
    }
    
    console.log('All slides cleared successfully');
  } catch (error) {
    console.error('Error clearing slides:', error);
    throw error;
  }
};

// Delete a single slide from the server
export const deleteSingleSlideFromServer = async (slideName: string): Promise<void> => {
  console.log(`Deleting slide ${slideName} from server...`);
  
  try {
    const response = await fetch(`${SLIDES_API_ENDPOINT}/delete/${slideName}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Server error response:', responseText);
      try {
        // Try to parse as JSON first
        const errorData = JSON.parse(responseText);
        throw new Error(`Failed to delete slide: ${errorData.error || response.status} ${response.statusText}`);
      } catch (parseError) {
        // If parsing fails, use the raw text
        throw new Error(`Failed to delete slide: ${response.status} ${response.statusText} - ${responseText.substring(0, 100)}`);
      }
    }
    
    console.log('Slide deleted successfully');
  } catch (error) {
    console.error('Error deleting slide:', error);
    throw error;
  }
};

// Save slide order to the server
export const saveSlidesOrderToServer = async (slideNames: string[]): Promise<void> => {
  console.log('Saving slide order to server:', slideNames);
  
  try {
    const response = await fetch(`${SLIDES_API_ENDPOINT}/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ slideOrder: slideNames }),
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Server error response:', responseText);
      try {
        // Try to parse as JSON first
        const errorData = JSON.parse(responseText);
        throw new Error(`Failed to save slide order: ${errorData.error || response.status} ${response.statusText}`);
      } catch (parseError) {
        // If parsing fails, use the raw text
        throw new Error(`Failed to save slide order: ${response.status} ${response.statusText} - ${responseText.substring(0, 100)}`);
      }
    }
    
    console.log('Slide order saved successfully');
  } catch (error) {
    console.error('Error saving slide order:', error);
    throw error;
  }
};

// Move a slide (reorder) on the server
export const moveSlideOnServer = async (
  sourceIndex: number, 
  destinationIndex: number
): Promise<Slide[]> => {
  console.log(`Moving slide from index ${sourceIndex} to ${destinationIndex}`);
  
  try {
    const response = await fetch(`${SLIDES_API_ENDPOINT}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sourceIndex, destinationIndex }),
    });
    
    if (!response.ok) {
      const responseText = await response.text();
      console.error('Server error response:', responseText);
      try {
        // Try to parse as JSON first
        const errorData = JSON.parse(responseText);
        throw new Error(`Failed to move slide: ${errorData.error || response.status} ${response.statusText}`);
      } catch (parseError) {
        // If parsing fails, use the raw text
        throw new Error(`Failed to move slide: ${response.status} ${response.statusText} - ${responseText.substring(0, 100)}`);
      }
    }
    
    const responseText = await response.text();
    if (!responseText || responseText.trim() === '') {
      console.warn('Empty response from server');
      return [];
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('Slide moved successfully, new order:', data);
      return data;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError, 'Raw response:', responseText);
      throw new Error(`Invalid JSON response from server: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error moving slide:', error);
    throw error;
  }
};
