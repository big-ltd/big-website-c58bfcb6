
export interface Slide {
  id: string;
  file: File | null;
  imageUrl: string;
  serverPath?: string; // Path on the server
  order: number;
}

export interface SlideState {
  slides: Slide[];
  currentSlideIndex: number;
}
