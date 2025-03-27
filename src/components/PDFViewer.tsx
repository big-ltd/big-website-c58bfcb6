
import React, { useEffect, useState, useRef } from 'react';
import { Fullscreen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
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

  // Inject performance enhancer script into iframe when it loads
  useEffect(() => {
    if (isLoaded && iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const iframe = iframeRef.current;
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        
        // Create script element
        const script = iframeDoc.createElement('script');
        script.src = '/pdf-viewer-enhancer.js';
        script.async = true;
        
        // Append to iframe document
        iframeDoc.body.appendChild(script);
      } catch (error) {
        console.error('Could not inject performance script into PDF viewer:', error);
      }
    }
  }, [isLoaded]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!iframeRef.current) return;

      // Check if the iframe is the active element or we're in fullscreen mode
      const isIframeFocused = document.activeElement === iframeRef.current || isFullscreen;
      
      if (isIframeFocused) {
        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'Space') {
          e.preventDefault();
          // Move to next page
          iframeRef.current.contentWindow?.postMessage({ type: 'nextPage' }, '*');
          setCurrentPage(prev => prev + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
          e.preventDefault();
          // Move to previous page
          iframeRef.current.contentWindow?.postMessage({ type: 'previousPage' }, '*');
          setCurrentPage(prev => Math.max(1, prev - 1));
        } else if (e.key === 'Escape' && isFullscreen) {
          // Handle ESC key in fullscreen mode
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, currentPage]);

  // Focus the iframe when it loads
  const handleIframeLoad = () => {
    setIsLoaded(true);
    if (iframeRef.current) {
      // Focus the iframe
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.focus();
        }
      }, 500); // Short delay to ensure PDF.js is initialized
    }
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
            src={`${pdfUrl}#page=1&view=FitH&pagemode=thumbs`}
            className="w-full h-full"
            title="Investor Document"
            tabIndex={0}
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
