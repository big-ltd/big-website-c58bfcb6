
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Trash } from 'lucide-react';
import type { Slide } from '@/hooks/useSlideManagement';

interface SlidePreviewProps {
  slide: Slide;
  index: number;
  totalSlides: number;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  showControls?: boolean;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({
  slide,
  index,
  totalSlides,
  onMoveUp,
  onMoveDown,
  onDelete,
  showControls = true
}) => {
  return (
    <div className="relative group">
      <img 
        src={slide.url} 
        alt={`Slide ${index + 1}`} 
        className="w-full h-40 object-contain bg-gray-900 rounded-md"
      />
      
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white mr-2">
            Slide {index + 1}
          </span>
          
          {showControls && (
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 bg-gray-800 text-white hover:bg-gray-700"
                onClick={() => onMoveUp(slide.id)}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 bg-gray-800 text-white hover:bg-gray-700"
                onClick={() => onMoveDown(slide.id)}
                disabled={index === totalSlides - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 bg-red-900 text-white hover:bg-red-800"
                onClick={() => onDelete(slide.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SlidePreview;
