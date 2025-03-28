
export interface Slide {
  url: string;
  name: string;
  originalName?: string;
}

export interface SlidesOrder {
  slides: string[];
  lastUpdated: number;
}
