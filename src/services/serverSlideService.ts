
import { Slide } from '@/types/slideTypes';

// API endpoint for slide operations
const SLIDES_API_ENDPOINT = '/api/slides';

// Upload files to the server
export const uploadSlidesToServer = async (files: FileList): Promise<Slide[]> => {
  const formData = new FormData();
  
  Array.from(files).forEach(file => {
    formData.append('slides', file);
    console.log(`Adding file to upload: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
  });
  
  console.log(`Uploading ${files.length} files to server...`);
  
  try {
    console.log(`Sending POST request to ${SLIDES_API_ENDPOINT}/upload.php`);
    
    const response = await fetch(`${SLIDES_API_ENDPOINT}/upload.php`, {
      method: 'POST',
      body: formData,
    });
    
    console.log(`Server responded with status: ${response.status} ${response.statusText}`);
    
    // Get response as text first for debugging
    const responseText = await response.text();
    console.log('Raw server response:', responseText);
    
    if (!response.ok) {
      console.error(`Server error response (${response.status}): ${responseText}`);
      
      // Check if response contains HTML (which indicates a server error)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        throw new Error(`Server returned HTML instead of JSON. This usually indicates a PHP error. Please check server logs.`);
      }
      
      throw new Error(`HTTP error ${response.status}: ${response.statusText}. Server message: ${responseText.substring(0, 200)}`);
    }
    
    // Handle empty response
    if (!responseText || responseText.trim() === '') {
      console.warn('Warning: Server returned empty response');
      return [];
    }
    
    // Try to parse the response as JSON
    try {
      // Check if response contains HTML (which indicates a server error)
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        console.error('Server returned HTML instead of JSON. Full response:', responseText);
        throw new Error('Server returned HTML instead of JSON. This usually indicates a PHP error. Please check server logs.');
      }
      
      const data = JSON.parse(responseText);
      console.log('Parsed server response:', data);
      return data;
    } catch (parseError) {
      console.error('Failed to parse server response as JSON:', parseError);
      console.error('First 500 characters of response:', responseText.substring(0, 500));
      
      // Provide more detailed error message for HTML responses
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        throw new Error('Server returned HTML instead of JSON. This usually indicates a PHP error or incorrect server configuration.');
      }
      
      throw new Error(`Server returned invalid JSON. Details: ${parseError.message}. Response starts with: ${responseText.substring(0, 100)}`);
    }
  } catch (error) {
    console.error('Error uploading slides:', error);
    throw error;
  }
};

// Fetch slides from the server
export const fetchSlidesFromServer = async (): Promise<Slide[]> => {
  console.log('Fetching slides from server...');
  
  try {
    const response = await fetch(`${SLIDES_API_ENDPOINT}/list.php`);
    
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
    const response = await fetch(`${SLIDES_API_ENDPOINT}/clear.php`, {
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
    const response = await fetch(`${SLIDES_API_ENDPOINT}/order.php`, {
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
    const response = await fetch(`${SLIDES_API_ENDPOINT}/move.php`, {
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
