
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, Trash } from 'lucide-react';

interface SlidePreviewProps {
  slides: { url: string, name: string }[];
  uploadLoading: boolean;
  onMoveSlide: (sourceIndex: number, destinationIndex: number) => Promise<void>;
  onDeleteSlide: (slideIndex: number) => Promise<void>;
}

const SlidePreview = ({ slides, uploadLoading, onMoveSlide, onDeleteSlide }: SlidePreviewProps) => {
  if (slides.length === 0) return null;

  // Helper function to handle button clicks with proper event handling
  const handleMoveClick = async (e: React.MouseEvent, sourceIndex: number, destinationIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Moving slide: from ${sourceIndex} to ${destinationIndex}`);
    await onMoveSlide(sourceIndex, destinationIndex);
  };

  const handleDeleteClick = async (e: React.MouseEvent, slideIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    await onDeleteSlide(slideIndex);
  };

  return (
    <div className="mt-4">
      <h3 className="text-white text-lg mb-2">Preview and Reorder Slides</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {slides.map((slide, index) => (
          <div key={slide.name + index} className="relative group">
            <img 
              src={slide.url}
              alt={`Slide ${index + 1}`} 
              className="w-full h-40 object-contain bg-gray-900 rounded-md"
              onError={(e) => {
                console.error(`Error loading image: ${slide.url}`);
                const imgElement = e.target as HTMLImageElement;
                imgElement.src = '/placeholder.svg';
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex flex-col items-center justify-center opacity-100 group-hover:opacity-100">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                Slide {index + 1}
              </span>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  size="sm" 
                  variant="secondary"
                  disabled={index === 0 || uploadLoading}
                  onClick={(e) => handleMoveClick(e, index, index - 1)}
                  type="button"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  disabled={index === slides.length - 1 || uploadLoading}
                  onClick={(e) => handleMoveClick(e, index, index + 1)}
                  type="button"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  disabled={uploadLoading}
                  onClick={(e) => handleDeleteClick(e, index)}
                  type="button"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlidePreview;
