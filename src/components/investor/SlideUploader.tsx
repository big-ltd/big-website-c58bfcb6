
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash, RefreshCw, Download, AlertCircle } from 'lucide-react';
import { SLIDES_FOLDER } from '@/types/slideTypes';
import { useToast } from '@/hooks/use-toast';

interface SlideUploaderProps {
  currentSlides: { url: string, name: string }[];
  uploadLoading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onClearAllSlides: () => Promise<void>;
  onRefreshCache: () => Promise<void>;
  onDownloadAllSlides?: () => Promise<void>;
  hasError?: boolean;
}

const SlideUploader = ({ 
  currentSlides, 
  uploadLoading, 
  onFileUpload, 
  onClearAllSlides, 
  onRefreshCache,
  onDownloadAllSlides,
  hasError = false
}: SlideUploaderProps) => {
  const { toast } = useToast();

  // Check if JSZip is available
  const [jsZipAvailable, setJsZipAvailable] = useState(false);
  
  useEffect(() => {
    // Try to load JSZip dynamically for download functionality
    const loadJSZip = async () => {
      try {
        if (!(window as any).JSZip) {
          await import('jszip').then(module => {
            (window as any).JSZip = module.default;
          });
        }
        setJsZipAvailable(true);
      } catch (err) {
        console.error("Could not load JSZip:", err);
        setJsZipAvailable(false);
      }
    };
    
    loadJSZip();
  }, []);
  
  // Install JSZip if not available
  const installJSZip = async () => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.async = true;
    script.onload = () => {
      setJsZipAvailable(true);
      toast({
        title: "Success",
        description: "JSZip library loaded successfully"
      });
    };
    script.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to load JSZip library",
        variant: "destructive"
      });
    };
    document.head.appendChild(script);
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
          
          {jsZipAvailable && onDownloadAllSlides && currentSlides.length > 0 && (
            <Button 
              variant="default"
              onClick={() => onDownloadAllSlides()}
              disabled={uploadLoading}
              type="button"
            >
              <Download className="h-4 w-4 mr-2" /> Download All Slides
            </Button>
          )}
          
          {!jsZipAvailable && currentSlides.length > 0 && (
            <Button 
              variant="secondary"
              onClick={installJSZip}
              disabled={uploadLoading}
              type="button"
            >
              <Download className="h-4 w-4 mr-2" /> Enable Downloads
            </Button>
          )}
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
          <p className="font-semibold">Automatic File Download</p>
          <p className="text-sm">
            When you upload slides, they will be saved in your browser and also downloaded to your computer.
            You can use the Download button to get all slides as a ZIP file.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SlideUploader;
