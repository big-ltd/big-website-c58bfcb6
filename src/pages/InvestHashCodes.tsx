
import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { crypto } from '@/utils/crypto';
import { Loader2, Plus, Trash, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';

// Hardcoded hash for admin access - in a real app, use a more secure approach
const ADMIN_HASH = "adminSecretHash123"; // You should change this to your preferred admin hash
const STORAGE_BUCKET = "investor_docs";
const SLIDES_FOLDER = "slides";

const InvestHashCodes = () => {
  const [searchParams] = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hashCodes, setHashCodes] = useState<any[]>([]);
  const [newInvestorName, setNewInvestorName] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [currentSlides, setCurrentSlides] = useState<{url: string, name: string}[]>([]);
  // Add a timestamp to force cache refresh when needed
  const [cacheTimestamp, setCacheTimestamp] = useState<number>(Date.now());
  const { toast } = useToast();

  useEffect(() => {
    const hash = searchParams.get('hash');
    if (hash === ADMIN_HASH) {
      setIsAuthorized(true);
      fetchHashCodes();
      checkCurrentSlides();
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

  const checkCurrentSlides = async () => {
    try {
      // Update the cache timestamp to force new data loading
      setCacheTimestamp(Date.now());
      
      const { data, error } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .list(`${SLIDES_FOLDER}/`, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Filter for image files
        const imageFiles = data.filter(file => 
          file.name.toLowerCase().endsWith('.jpg') || 
          file.name.toLowerCase().endsWith('.jpeg') || 
          file.name.toLowerCase().endsWith('.png')
        );
        
        // Sort files by name (assuming they are named with numbers like 01.jpg, 02.jpg, etc.)
        imageFiles.sort((a, b) => {
          // Extract numbers from filenames for natural sorting
          const nameA = a.name;
          const nameB = b.name;
          return nameA.localeCompare(nameB, undefined, { numeric: true });
        });
        
        // Get public URLs for all slides and add cache-busting parameter
        const slideFiles = imageFiles.map(file => {
          const { data } = supabase.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(`${SLIDES_FOLDER}/${file.name}`);
          return {
            url: `${data.publicUrl}?t=${cacheTimestamp}`,
            name: file.name
          };
        });
        
        setCurrentSlides(slideFiles);
      } else {
        setCurrentSlides([]);
      }
    } catch (error) {
      console.error('Error checking current slides:', error);
      // Don't show an error toast as the slides might not exist yet
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
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadLoading(true);

    try {
      // First, get the existing slides to determine the next slide number
      const { data: existingFiles, error: listError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .list(`${SLIDES_FOLDER}/`, {
          sortBy: { column: 'name', order: 'asc' }
        });
      
      if (listError) {
        throw listError;
      }
      
      // Filter for image files
      const existingImageFiles = existingFiles ? existingFiles.filter(file => 
        file.name.toLowerCase().endsWith('.jpg') || 
        file.name.toLowerCase().endsWith('.jpeg') || 
        file.name.toLowerCase().endsWith('.png')
      ) : [];
      
      // Determine the start number for new slides (next after the highest existing number)
      let nextSlideNumber = 1; // Default to 1 if no slides exist
      
      if (existingImageFiles.length > 0) {
        // Extract the highest number from existing filenames
        const fileNumbers = existingImageFiles.map(file => {
          const nameMatch = file.name.match(/^(\d+)\./);
          return nameMatch ? parseInt(nameMatch[1], 10) : 0;
        });
        
        nextSlideNumber = Math.max(...fileNumbers) + 1;
      }
      
      // Process and upload each file with the next available numbers
      const uploadPromises = Array.from(files).map(async (file, index) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Error",
            description: `${file.name} is not an image file`,
            variant: "destructive",
          });
          return null;
        }

        // Create a padded file number (e.g., 01.jpg, 02.jpg) for proper ordering
        const fileNumber = String(nextSlideNumber + index).padStart(2, '0');
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const newFileName = `${fileNumber}.${fileExtension}`;

        // Add a timestamp parameter to avoid browser caching issues
        const timestamp = Date.now();
        
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(`${SLIDES_FOLDER}/${newFileName}`, file, {
            cacheControl: '0', // Disable cache
            upsert: true
          });

        if (error) {
          console.error(`Upload error for ${file.name}:`, error);
          throw new Error(error.message);
        }

        // Get the public URL
        const { data } = supabase
          .storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(`${SLIDES_FOLDER}/${newFileName}`);
        
        return {
          url: `${data.publicUrl}?t=${timestamp}`,
          name: newFileName
        };
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean);
      
      if (successfulUploads.length > 0) {
        // Force a cache refresh
        setCacheTimestamp(Date.now());
        await checkCurrentSlides();
        toast({
          title: "Success",
          description: `${successfulUploads.length} slides uploaded successfully`,
        });
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: `Failed to upload slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleClearAllSlides = async (showConfirm = true) => {
    if (showConfirm && !confirm("Are you sure you want to delete all slides? This action cannot be undone.")) {
      return;
    }

    if (showConfirm) {
      setUploadLoading(true);
    }

    try {
      // List all files in the slides folder
      const { data, error } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .list(SLIDES_FOLDER);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Create an array of file paths to delete
        const filesToDelete = data.map(file => `${SLIDES_FOLDER}/${file.name}`);
        
        // Delete all files
        const { error: deleteError } = await supabase
          .storage
          .from(STORAGE_BUCKET)
          .remove(filesToDelete);

        if (deleteError) {
          throw deleteError;
        }

        setCurrentSlides([]);
        
        if (showConfirm) {
          toast({
            title: "Success",
            description: "All slides have been deleted",
          });
        }
      } else if (showConfirm) {
        toast({
          title: "Info",
          description: "No slides to delete",
        });
      }
    } catch (error) {
      console.error('Error deleting slides:', error);
      if (showConfirm) {
        toast({
          title: "Error",
          description: `Failed to delete slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
    } finally {
      if (showConfirm) {
        setUploadLoading(false);
      }
    }
  };

  const handleMoveSlide = async (sourceIndex: number, destinationIndex: number) => {
    if (sourceIndex === destinationIndex) return;
    
    setUploadLoading(true);
    
    try {
      // Create a copy of currentSlides to manipulate
      const updatedSlides = [...currentSlides];
      
      // Remove the slide from source position and insert at destination
      const [movedSlide] = updatedSlides.splice(sourceIndex, 1);
      updatedSlides.splice(destinationIndex, 0, movedSlide);
      
      // Create new slide objects with updated numbers
      const renamedSlides = updatedSlides.map((slide, index) => {
        const fileNumber = String(index + 1).padStart(2, '0');
        const fileExtension = slide.name.split('.').pop()?.split('?')[0] || 'jpg'; // Remove any query params
        return {
          ...slide,
          newName: `${fileNumber}.${fileExtension}`,
          oldName: slide.name
        };
      });
      
      // First, download all the images
      const downloadPromises = renamedSlides.map(async (slide) => {
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .download(`${SLIDES_FOLDER}/${slide.name}`);
        
        if (error) {
          throw error;
        }
        
        return {
          ...slide,
          file: data
        };
      });
      
      const slidesWithFiles = await Promise.all(downloadPromises);
      
      // Delete all existing files
      await handleClearAllSlides(false);
      
      // Upload files with new names
      const uploadPromises = slidesWithFiles.map(async (slide) => {
        const { error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(`${SLIDES_FOLDER}/${slide.newName}`, slide.file, {
            cacheControl: '0', // Disable cache
            upsert: true
          });
        
        if (error) {
          throw error;
        }
        
        const { data } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(`${SLIDES_FOLDER}/${slide.newName}`);
        
        return {
          url: `${data.publicUrl}?t=${cacheTimestamp}`,
          name: slide.newName
        };
      });
      
      await Promise.all(uploadPromises);
      
      // Force a cache refresh
      setCacheTimestamp(Date.now());
      
      // Refresh the slide list
      await checkCurrentSlides();
      
      toast({
        title: "Success",
        description: "Slides reordered successfully",
      });
    } catch (error) {
      console.error('Error reordering slides:', error);
      toast({
        title: "Error",
        description: `Failed to reorder slides: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      // Attempt to refresh the current slides to show current state
      await checkCurrentSlides();
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRefreshCache = async () => {
    setUploadLoading(true);
    try {
      // Force a reload of the slide cache by updating timestamp
      setCacheTimestamp(Date.now());
      await checkCurrentSlides();
      
      toast({
        title: "Success",
        description: "Slide cache refreshed",
      });
    } catch (error) {
      console.error('Error refreshing cache:', error);
      toast({
        title: "Error",
        description: "Failed to refresh slide cache",
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
              <h2 className="text-xl text-white mb-4">Upload Investor Slides</h2>
              <div className="bg-gray-700 p-4 rounded-md mb-4">
                <div className="flex flex-col gap-3">
                  <label className="text-white text-sm">
                    Current Slides: {currentSlides.length > 0 ? (
                      <span className="text-blue-400 ml-2">
                        {currentSlides.length} slides available
                      </span>
                    ) : "No slides uploaded yet"}
                  </label>
                  
                  <div className="flex gap-3 items-center">
                    <Input
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
                      onClick={() => handleClearAllSlides(true)}
                      disabled={uploadLoading || currentSlides.length === 0}
                    >
                      <Trash className="h-4 w-4 mr-2" /> Clear All Slides
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleRefreshCache}
                      disabled={uploadLoading}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Refresh Cache
                    </Button>
                  </div>
                  
                  <p className="text-gray-400 text-sm">
                    Upload JPG or PNG image files. Files will be automatically numbered in the order they're selected.
                    For best results, select files in the order you want them to appear in the presentation.
                    You can reorder slides by using the up/down arrows after uploading.
                  </p>
                </div>
              </div>
              
              {currentSlides.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-white text-lg mb-2">Preview and Reorder Slides</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {currentSlides.map((slide, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={`${slide.url}&t=${Date.now()}`} // Force cache refresh for preview
                          alt={`Slide ${index + 1}`} 
                          className="w-full h-40 object-contain bg-gray-900 rounded-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex flex-col items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity mb-2">
                            Slide {index + 1}
                          </span>
                          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              disabled={index === 0 || uploadLoading}
                              onClick={() => handleMoveSlide(index, index - 1)}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              disabled={index === currentSlides.length - 1 || uploadLoading}
                              onClick={() => handleMoveSlide(index, index + 1)}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                <Button onClick={handleAddInvestor}>
                  <Plus className="h-4 w-4 mr-2" /> Generate Hash Code
                </Button>
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
