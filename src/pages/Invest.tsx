
import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import Cookies from 'js-cookie';
import { Fullscreen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COOKIE_NAME = 'investor_authenticated';
const STORAGE_BUCKET = "investor_docs";
const PDF_FILE_NAME = "invest.pdf";

const Invest = () => {
  const [searchParams] = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthorization = async () => {
      // Check if already authorized via cookie
      const cookie = Cookies.get(COOKIE_NAME);
      if (cookie) {
        setIsAuthorized(true);
        await getPdfUrl();
        setLoading(false);
        return;
      }

      // Check hash code from URL
      const hash = searchParams.get('hash');
      if (!hash) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      try {
        // Query the database to check if hash exists and is not redeemed
        const { data, error } = await supabase
          .from('investor_hash_codes')
          .select('*')
          .eq('hash_code', hash)
          .eq('redeemed', false)
          .single();

        if (error || !data) {
          console.error('Error checking hash code:', error);
          setIsAuthorized(false);
          toast({
            title: "Access Denied",
            description: "Invalid or expired access code.",
            variant: "destructive",
          });
        } else {
          // Set cookie for future access
          Cookies.set(COOKIE_NAME, 'true', { expires: 365 }); // 1 year expiry

          // Mark hash as redeemed
          await supabase
            .from('investor_hash_codes')
            .update({ redeemed: true })
            .eq('hash_code', hash);

          await getPdfUrl();
          setIsAuthorized(true);
          toast({
            title: "Access Granted",
            description: `Welcome, ${data.investor_name}`,
          });
        }
      } catch (err) {
        console.error('Error:', err);
        setIsAuthorized(false);
      }

      setLoading(false);
    };

    checkAuthorization();
  }, [searchParams, toast]);

  const getPdfUrl = async () => {
    try {
      // Try to get the PDF URL from Supabase storage
      const { data } = supabase
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(PDF_FILE_NAME);
      
      // Check if the URL is valid by making a HEAD request
      try {
        const response = await fetch(data.publicUrl, { method: 'HEAD' });
        if (response.ok) {
          setPdfUrl(data.publicUrl);
        } else {
          throw new Error('PDF not found');
        }
      } catch (fetchError) {
        // If there's an error with the fetch or the PDF doesn't exist,
        // fall back to the static file
        console.error('Error checking PDF existence:', fetchError);
        setPdfUrl('/lovable-uploads/invest.pdf');
      }
    } catch (error) {
      console.error('Error getting PDF URL:', error);
      // Fallback to the static PDF if there's an error
      setPdfUrl('/lovable-uploads/invest.pdf');
    }
  };

  const toggleFullscreen = () => {
    const iframe = document.getElementById('pdf-viewer') as HTMLIFrameElement;
    if (!iframe) return;

    if (!isFullscreen) {
      if (iframe.requestFullscreen) {
        iframe.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Add keyboard navigation for PDF
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const iframe = document.getElementById('pdf-viewer') as HTMLIFrameElement;
      if (!iframe) return;

      // Check if the iframe is the active element or we're in fullscreen mode
      const isIframeFocused = document.activeElement === iframe || isFullscreen;
      
      if (isIframeFocused) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          // Move to next page - using postMessage to communicate with PDF.js inside iframe
          iframe.contentWindow?.postMessage({ type: 'nextPage' }, '*');
          setCurrentPage(prev => prev + 1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          // Move to previous page
          iframe.contentWindow?.postMessage({ type: 'previousPage' }, '*');
          setCurrentPage(prev => Math.max(1, prev - 1));
        } else if (e.key === 'Escape' && isFullscreen) {
          // Handle ESC key in fullscreen mode
          if (document.exitFullscreen) {
            document.exitFullscreen();
          }
        }
      }
    };

    // Focus the iframe when it loads to enable keyboard navigation
    const focusIframe = () => {
      const iframe = document.getElementById('pdf-viewer') as HTMLIFrameElement;
      if (iframe) {
        iframe.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Set a timeout to focus the iframe after it's loaded
    const focusTimeout = setTimeout(focusIframe, 1000);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimeout);
    };
  }, [isFullscreen, currentPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-white text-xl font-semibold">Verifying access...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 bg-gradient-primary flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">Investor Information</h1>
            {pdfUrl && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleFullscreen}
                className="bg-transparent border-white text-white hover:bg-white/20"
              >
                <Fullscreen />
                <span className="sr-only">Toggle fullscreen</span>
              </Button>
            )}
          </div>
          <div className="w-full h-[calc(100vh-200px)]">
            {pdfUrl ? (
              <iframe
                id="pdf-viewer"
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                className="w-full h-full"
                title="Investor Document"
                tabIndex={0} // Make iframe focusable for keyboard navigation
                onLoad={() => {
                  // Focus the iframe when it loads
                  const iframe = document.getElementById('pdf-viewer');
                  if (iframe) iframe.focus();
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-white">No investor document available. Please contact the administrator.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invest;
