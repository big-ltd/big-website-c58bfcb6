
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
    
    // Instead of using browser fullscreen, communicate with the iframe
    // to trigger custom fullscreen within PDF.js
    if (iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'toggleFullscreen' }, '*');
    }
  };

  // Listen for messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'fullscreenChange') {
        setIsFullscreen(event.data.isFullscreen);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
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
    if (!url.includes('#')) {
      url += '#';
    } else {
      url += '&';
    }
    
    // Configure the viewer:
    // - pagemode=thumbs: show thumbnails navigation
    // - view=Fit: fit the page to the viewport
    // - toolbar=0: hide the default toolbar (we'll remove download button via CSS)
    url += 'pagemode=thumbs&view=Fit';
    
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
