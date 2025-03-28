
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
export const STORAGE_BUCKET = 'lovable-uploads';
export const SLIDES_FOLDER = 'slides';
export const SLIDES_ORDER_FILE = 'invest_slides.json';
