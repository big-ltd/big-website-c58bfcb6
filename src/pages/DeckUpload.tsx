
import React, { useRef } from 'react';
import { useDeckState } from '@/hooks/useDeckState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Trash2, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function DeckUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, addSlides, removeSlide, moveSlideUp, moveSlideDown } = useDeckState();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Filter for only JPG/JPEG files
    const jpgFiles = Array.from(files).filter(
      file => file.type === 'image/jpeg' || file.type === 'image/jpg'
    );
    
    if (jpgFiles.length !== files.length) {
      toast({
        title: "Warning",
        description: "Only JPG files are allowed. Non-JPG files were ignored.",
        variant: "destructive"
      });
    }
    
    if (jpgFiles.length > 0) {
      addSlides(jpgFiles);
      toast({
        title: "Success",
        description: `${jpgFiles.length} slides uploaded successfully.`
      });
    }
    
    // Reset the input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Deck Upload</h1>
      
      <div className="mb-6">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept=".jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button onClick={handleUploadClick} className="mb-4">
          <Upload className="mr-2 h-4 w-4" /> Upload JPG Slides
        </Button>
        
        <p className="text-sm text-muted-foreground mb-4">
          Upload JPG files to create slides. Drag and reorder them as needed.
        </p>
      </div>

      {state.slides.length === 0 ? (
        <div className="text-center p-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No slides uploaded yet. Upload some JPG files to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.slides.map((slide) => (
            <Card key={slide.id} className="overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={slide.imageUrl}
                  alt={`Slide ${slide.order + 1}`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                  {slide.order + 1}
                </div>
              </div>
              
              <div className="p-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => moveSlideUp(slide.id)}
                    disabled={slide.order === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => moveSlideDown(slide.id)}
                    disabled={slide.order === state.slides.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => removeSlide(slide.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
