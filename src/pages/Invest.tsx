
import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import Cookies from 'js-cookie';

const COOKIE_NAME = 'investor_authenticated';
const PDF_URL = '/lovable-uploads/invest.pdf'; // Update this path to your actual PDF

const Invest = () => {
  const [searchParams] = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuthorization = async () => {
      // Check if Supabase is configured
      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        setIsSupabaseConfigured(false);
        setLoading(false);
        toast({
          title: "Configuration Error",
          description: "Supabase is not configured. Please set the required environment variables.",
          variant: "destructive",
        });
        return;
      }

      // Check if already authorized via cookie
      const cookie = Cookies.get(COOKIE_NAME);
      if (cookie) {
        setIsAuthorized(true);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-white text-xl font-semibold">Verifying access...</div>
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-4">Configuration Required</h1>
          <p className="text-gray-300 mb-4">
            This feature requires Supabase configuration. Please set the VITE_SUPABASE_URL and 
            VITE_SUPABASE_ANON_KEY environment variables.
          </p>
        </div>
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
            <iframe
              src={PDF_URL}
              className="w-full h-full"
              title="Investor Document"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invest;
