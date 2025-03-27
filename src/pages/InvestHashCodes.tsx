
import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { crypto } from '@/utils/crypto';
import { Loader2 } from 'lucide-react';

// Hardcoded hash for admin access - in a real app, use a more secure approach
const ADMIN_HASH = "adminSecretHash123"; // You should change this to your preferred admin hash
const STORAGE_BUCKET = "investor_docs";
const PDF_FILE_NAME = "invest.pdf";

const InvestHashCodes = () => {
  const [searchParams] = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hashCodes, setHashCodes] = useState<any[]>([]);
  const [newInvestorName, setNewInvestorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const hash = searchParams.get('hash');
    if (hash === ADMIN_HASH) {
      setIsAuthorized(true);
      fetchHashCodes();
      checkCurrentPdf();
    } else {
      setIsAuthorized(false);
    }
    setLoading(false);
  }, [searchParams]);

  const fetchHashCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('investor_hash_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setHashCodes(data || []);
    } catch (error) {
      console.error('Error fetching hash codes:', error);
      toast({
        title: "Error",
        description: "Failed to load hash codes",
        variant: "destructive",
      });
    }
  };

  const checkCurrentPdf = async () => {
    try {
      const { data } = supabase
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(PDF_FILE_NAME);
      
      // Verify if the file exists by making a HEAD request
      try {
        const response = await fetch(data.publicUrl, { method: 'HEAD' });
        if (response.ok) {
          setCurrentPdfUrl(data.publicUrl);
        }
      } catch (error) {
        console.error('Error checking if PDF exists:', error);
        // Don't show an error toast as the PDF might not exist yet
      }
    } catch (error) {
      console.error('Error checking current PDF:', error);
      // Don't show an error toast as the PDF might not exist yet
    }
  };

  const handleAddInvestor = async () => {
    if (!newInvestorName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an investor name",
        variant: "destructive",
      });
      return;
    }

    try {
      // Generate a random hash code
      const hashCode = crypto.generateRandomHash();

      const { error } = await supabase
        .from('investor_hash_codes')
        .insert([
          {
            investor_name: newInvestorName.trim(),
            hash_code: hashCode,
            redeemed: false
          }
        ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "New investor hash code created",
      });

      setNewInvestorName('');
      fetchHashCodes();
    } catch (error) {
      console.error('Error adding investor:', error);
      toast({
        title: "Error",
        description: "Failed to create new hash code",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    setUploadLoading(true);

    try {
      // Upload the file with upsert:true to replace any existing file
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(PDF_FILE_NAME, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error("Upload error details:", error);
        throw new Error(error.message);
      }

      // Get the public URL
      const { data } = supabase
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(PDF_FILE_NAME);
      
      setCurrentPdfUrl(data.publicUrl);

      toast({
        title: "Success",
        description: "Investor PDF uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error",
        description: `Failed to upload PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
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
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 bg-gradient-primary">
            <h1 className="text-2xl font-bold text-white">Investor Hash Codes Management</h1>
          </div>
          
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xl text-white mb-4">Upload Investor PDF</h2>
              <div className="bg-gray-700 p-4 rounded-md mb-4">
                <div className="flex flex-col gap-3">
                  <label className="text-white text-sm">
                    Current PDF: {currentPdfUrl ? (
                      <a 
                        href={currentPdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline ml-2"
                      >
                        View PDF
                      </a>
                    ) : "No PDF uploaded yet"}
                  </label>
                  
                  <div className="flex gap-3 items-center">
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileUpload}
                      className="max-w-md"
                      disabled={uploadLoading}
                    />
                    {uploadLoading && <Loader2 className="h-5 w-5 animate-spin text-white" />}
                  </div>
                  
                  <p className="text-gray-400 text-sm">
                    Upload a PDF file. This will replace the current investor information document.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl text-white mb-4">Add New Investor</h2>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="Investor Name"
                  value={newInvestorName}
                  onChange={(e) => setNewInvestorName(e.target.value)}
                  className="max-w-md"
                />
                <Button onClick={handleAddInvestor}>Generate Hash Code</Button>
              </div>
            </div>

            <div>
              <h2 className="text-xl text-white mb-4">Existing Hash Codes</h2>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investor Name</TableHead>
                      <TableHead>Hash Code</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hashCodes.length > 0 ? (
                      hashCodes.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.investor_name}</TableCell>
                          <TableCell>{item.hash_code}</TableCell>
                          <TableCell>
                            <a 
                              href={`/invest?hash=${item.hash_code}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              /invest?hash={item.hash_code}
                            </a>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${item.redeemed ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                              {item.redeemed ? 'Redeemed' : 'Available'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-gray-400">
                          No hash codes found. Add your first investor above.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestHashCodes;
