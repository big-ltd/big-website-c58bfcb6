
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
