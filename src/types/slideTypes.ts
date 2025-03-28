
export interface Slide {
  url: string;
  name: string;
  originalName?: string;
}

export interface SlidesOrder {
  slides: string[];
  lastUpdated: number;
}

// Constants for storage
export const SLIDES_FOLDER = 'slides';
export const SLIDES_ORDER_FILE = 'slides_order.json';
export const STORAGE_BUCKET = 'lovable-uploads';
