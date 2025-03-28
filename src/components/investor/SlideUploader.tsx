
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash, RefreshCw, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SlideUploaderProps {
  currentSlides: { url: string, name: string }[];
  uploadLoading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onClearAllSlides: () => Promise<void>;
  onRefreshCache: () => Promise<void>;
  hasError?: boolean;
}

const SlideUploader = ({ 
  currentSlides, 
  uploadLoading, 
  onFileUpload, 
  onClearAllSlides, 
  onRefreshCache,
  hasError = false
}: SlideUploaderProps) => {
  const { toast } = useToast();
  
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
            type="file"
            accept="image/*"
            onChange={onFileUpload}
            multiple
            className="max-w-md"
            disabled={uploadLoading}
          />
          {uploadLoading && <Loader2 className="h-5 w-5 animate-spin text-white" />}
          
          <Button 
            variant="destructive"
            onClick={() => onClearAllSlides()}
            disabled={uploadLoading || currentSlides.length === 0}
            type="button"
          >
            <Trash className="h-4 w-4 mr-2" /> Clear All Slides
          </Button>
          
          <Button
            variant="outline"
            onClick={() => onRefreshCache()}
            disabled={uploadLoading}
            type="button"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh Cache
          </Button>
        </div>
        
        {hasError && (
          <div className="bg-red-900/30 text-red-200 p-3 rounded flex items-start gap-2 mt-1">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Storage Error</p>
              <p className="text-sm">There was an issue with browser storage. Your changes may not persist between sessions.</p>
            </div>
          </div>
        )}
        
        <div className="text-yellow-300 bg-yellow-900/30 p-3 rounded mt-2">
          <p className="font-semibold">Slide Storage</p>
          <p className="text-sm">
            Slides are stored in your browser's local storage. They will be available as long as you use the same browser
            and don't clear your browser data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SlideUploader;
