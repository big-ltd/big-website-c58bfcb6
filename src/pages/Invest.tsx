import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import Cookies from 'js-cookie';

const COOKIE_NAME = 'investor_authenticated';
const STORAGE_BUCKET = "investor_docs";
const PDF_FILE_NAME = "invest.pdf";

const Invest = () => {
  const [searchParams] = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState('');
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
          <div className="p-4 bg-gradient-primary">
            <h1 className="text-2xl font-bold text-white">Investor Information</h1>
          </div>
          <div className="w-full h-[calc(100vh-200px)]">
            {pdfUrl ? (
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title="Investor Document"
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
