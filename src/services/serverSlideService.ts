
import { Slide } from '@/types/slideTypes';

// API endpoint for slide operations
const SLIDES_API_ENDPOINT = '/api/slides';

// Upload files to the server
export const uploadSlidesToServer = async (files: FileList): Promise<Slide[]> => {
  const formData = new FormData();
  
  Array.from(files).forEach(file => {
    formData.append('slides', file);
  });
  
  const response = await fetch(`${SLIDES_API_ENDPOINT}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload slides');
  }
  
  return response.json();
};

// Fetch slides from the server
export const fetchSlidesFromServer = async (): Promise<Slide[]> => {
  const response = await fetch(`${SLIDES_API_ENDPOINT}/list`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch slides');
  }
  
  return response.json();
};

// Delete all slides from the server
export const clearAllSlidesFromServer = async (): Promise<void> => {
  const response = await fetch(`${SLIDES_API_ENDPOINT}/clear`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to clear slides');
  }
};

// Delete a single slide from the server
export const deleteSingleSlideFromServer = async (slideName: string): Promise<void> => {
  const response = await fetch(`${SLIDES_API_ENDPOINT}/delete/${slideName}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete slide');
  }
};

// Save slide order to the server
export const saveSlidesOrderToServer = async (slideNames: string[]): Promise<void> => {
  const response = await fetch(`${SLIDES_API_ENDPOINT}/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ slideOrder: slideNames }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to save slide order');
  }
};

// Move a slide (reorder) on the server
export const moveSlideOnServer = async (
  sourceIndex: number, 
  destinationIndex: number
): Promise<Slide[]> => {
  const response = await fetch(`${SLIDES_API_ENDPOINT}/move`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sourceIndex, destinationIndex }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to move slide');
  }
  
  return response.json();
};
