
export interface Slide {
  url: string;
  name: string;
  originalName?: string;
}

export interface SlidesOrder {
  slides: string[];
  lastUpdated: number;
}

export const STORAGE_BUCKET = "investor_docs";
export const SLIDES_FOLDER = "slides";
export const SLIDES_ORDER_FILE = "slides_order.json";
