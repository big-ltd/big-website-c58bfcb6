
export interface Slide {
  id: string;
  file: File | null;
  imageUrl: string;
  order: number;
}

export interface SlideState {
  slides: Slide[];
  currentSlideIndex: number;
}
