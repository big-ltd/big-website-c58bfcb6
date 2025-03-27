
import React, { useEffect, useState, useRef } from 'react';
import { Fullscreen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const toggleFullscreen = () => {
    if (!iframeRef.current) return;

    if (!isFullscreen) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Handle fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoaded(true);
  };

  // Construct URL with parameters to configure the built-in viewer
  const getPdfViewerUrl = () => {
    // Base URL
    let url = pdfUrl;
    
    // Add hash parameters to configure the PDF.js viewer
    // These are standard PDF.js parameters:
    // - page: initial page to show
    // - zoom: zoom level (page-fit, page-width, auto, etc)
    // - pagemode: display mode (thumbs, bookmarks, none)
    // - toolbar: show/hide toolbar (0 or 1)
    // - navpanes: show/hide navigation panes (0 or 1)
    
    // Check if URL already has a hash
    if (!url.includes('#')) {
      url += '#';
    } else {
      url += '&';
    }
    
    // Configure the viewer to show all pages in continuous mode
    url += 'view=Fit&pagemode=thumbs';
    
    return url;
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden h-full">
      <div className="p-4 bg-gradient-primary flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Investor Information</h1>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleFullscreen}
          className="bg-transparent border-white text-white hover:bg-white/20"
        >
          <Fullscreen />
          <span className="sr-only">Toggle fullscreen</span>
        </Button>
      </div>
      <div className="w-full h-[calc(100vh-200px)]">
        {pdfUrl ? (
          <iframe
            ref={iframeRef}
            src={getPdfViewerUrl()}
            className="w-full h-full"
            title="Investor Document"
            onLoad={handleIframeLoad}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-white">No investor document available. Please contact the administrator.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
