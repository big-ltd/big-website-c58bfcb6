
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash, RefreshCw } from 'lucide-react';

interface SlideUploaderProps {
  currentSlides: { url: string, name: string }[];
  uploadLoading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onClearAllSlides: () => Promise<void>;
  onRefreshCache: () => Promise<void>;
}

const SlideUploader = ({ 
  currentSlides, 
  uploadLoading, 
  onFileUpload, 
  onClearAllSlides, 
  onRefreshCache
}: SlideUploaderProps) => {
  // Create a ref for the file input to reset it after upload
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Handle file upload with input reset
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        console.log('No files selected');
        return;
      }
      
      console.log(`Selected ${e.target.files.length} files for upload`);
      await onFileUpload(e);
      
      // Reset the file input after upload attempt (successful or not)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error in file upload handler:', error);
      // Reset input even on error
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  return (
    <div className="bg-gray-700 p-4 rounded-md mb-4">
      <div className="flex flex-col gap-3">
        <label className="text-white text-sm">
          Current Slides: {currentSlides.length > 0 ? (
            <span className="text-blue-400 ml-2">
              {currentSlides.length} slides available
            </span>
          ) : "No slides uploaded yet"}
        </label>
        
        <div className="flex gap-3 items-center flex-wrap">
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            multiple
            className="max-w-md"
            disabled={uploadLoading}
          />
          {uploadLoading && <Loader2 className="h-5 w-5 animate-spin text-white" />}
          
          <Button 
            variant="destructive"
            onClick={onClearAllSlides}
            disabled={uploadLoading || currentSlides.length === 0}
            type="button"
          >
            <Trash className="h-4 w-4 mr-2" /> Clear All Slides
          </Button>
          
          <Button
            variant="outline"
            onClick={onRefreshCache}
            disabled={uploadLoading}
            type="button"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Cache
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SlideUploader;
