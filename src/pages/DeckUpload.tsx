
import React, { useRef, useState, useEffect } from 'react';
import { useDeckState } from '@/hooks/useDeckState';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Trash2, Upload, Copy, Plus, RefreshCw, Edit } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';

// Types for the hash access management
interface ViewingDevice {
  id: string;
  ipAddress: string;
  city?: string;
  country?: string;
  userAgent: string;
  timestamp: string;
}

interface HashCode {
  id: string;
  name: string;
  hash: string;
  maxDevices: number;
  devices: ViewingDevice[];
  createdAt: string;
}

export default function DeckUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { state, addSlides, removeSlide, moveSlideUp, moveSlideDown } = useDeckState();
  const [hashCodes, setHashCodes] = useState<HashCode[]>([]);
  const [newHashName, setNewHashName] = useState('');
  const [newMaxDevices, setNewMaxDevices] = useState('1');
  const [isLoading, setIsLoading] = useState(false);
  const [editingHashId, setEditingHashId] = useState<string | null>(null);
  const [editMaxDevices, setEditMaxDevices] = useState('1');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Filter for only JPG/JPEG files
    const jpgFiles = Array.from(files).filter(
      file => file.type === 'image/jpeg' || file.type === 'image/jpg'
    );
    
    if (jpgFiles.length !== files.length) {
      toast({
        title: "Warning",
        description: "Only JPG files are allowed. Non-JPG files were ignored.",
        variant: "destructive"
      });
    }
    
    if (jpgFiles.length > 0) {
      addSlides(jpgFiles);
      toast({
        title: "Success",
        description: `${jpgFiles.length} slides uploaded successfully.`
      });
    }
    
    // Reset the input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  // Fetch hash codes from the server
  const fetchHashCodes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/get-hash-codes.php');
      const data = await response.json();
      setHashCodes(data.hashCodes || []);
    } catch (error) {
      console.error('Error fetching hash codes:', error);
      toast({
        title: "Error",
        description: "Failed to load hash codes.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load hash codes on component mount
  useEffect(() => {
    fetchHashCodes();
  }, []);
  
  // Create a new hash code
  const createHashCode = async () => {
    if (!newHashName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the hash code.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-hash-code.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newHashName.trim(),
          maxDevices: parseInt(newMaxDevices, 10)
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "New hash code created successfully.",
        });
        setNewHashName('');
        setNewMaxDevices('1');
        fetchHashCodes();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create hash code.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating hash code:', error);
      toast({
        title: "Error",
        description: "Failed to create hash code.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update the max devices for a hash code
  const updateMaxDevices = async (id: string, maxDevices: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/update-hash-code.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, maxDevices }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Device limit updated successfully.",
        });
        fetchHashCodes();
        setEditingHashId(null);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update device limit.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating hash code:', error);
      toast({
        title: "Error",
        description: "Failed to update device limit.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a hash code
  const deleteHashCode = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hash code? This will revoke access for anyone using it.")) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/delete-hash-code.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Hash code deleted successfully.",
        });
        fetchHashCodes();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete hash code.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting hash code:', error);
      toast({
        title: "Error",
        description: "Failed to delete hash code.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Copy hash code link to clipboard
  const copyHashLink = (hash: string) => {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/deck?hash=${hash}`;
    
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        toast({
          title: "Copied!",
          description: "Link copied to clipboard.",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy link.",
          variant: "destructive"
        });
      });
  };

  // Start editing the max devices limit
  const startEditMaxDevices = (hashCode: HashCode) => {
    setEditingHashId(hashCode.id);
    setEditMaxDevices(hashCode.maxDevices.toString());
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingHashId(null);
    setEditMaxDevices('1');
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Deck Management</h1>
      
      <Tabs defaultValue="slides" className="mb-12">
        <TabsList className="mb-4">
          <TabsTrigger value="slides">Slide Manager</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
        </TabsList>
        
        <TabsContent value="slides">
          <div className="mb-6">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept=".jpg,.jpeg"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button onClick={handleUploadClick} className="mb-4">
              <Upload className="mr-2 h-4 w-4" /> Upload JPG Slides
            </Button>
            
            <p className="text-sm text-muted-foreground mb-4">
              Upload JPG files to create slides. Drag and reorder them as needed.
            </p>
          </div>

          {state.slides.length === 0 ? (
            <div className="text-center p-12 border border-dashed rounded-lg">
              <p className="text-muted-foreground">No slides uploaded yet. Upload some JPG files to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.slides.map((slide) => (
                <Card key={slide.id} className="overflow-hidden">
                  <div className="relative aspect-video">
                    <img
                      src={slide.imageUrl}
                      alt={`Slide ${slide.order + 1}`}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      {slide.order + 1}
                    </div>
                  </div>
                  
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => moveSlideUp(slide.id)}
                        disabled={slide.order === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => moveSlideDown(slide.id)}
                        disabled={slide.order === state.slides.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => removeSlide(slide.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="access">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h2 className="text-xl font-semibold mb-4">Create Access Link</h2>
              <div className="flex gap-2 flex-col sm:flex-row">
                <div className="flex-1">
                  <Input
                    placeholder="Enter name or organization"
                    value={newHashName}
                    onChange={(e) => setNewHashName(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-40">
                  <Select 
                    value={newMaxDevices} 
                    onValueChange={setNewMaxDevices}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Max Devices" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Device</SelectItem>
                      <SelectItem value="2">2 Devices</SelectItem>
                      <SelectItem value="3">3 Devices</SelectItem>
                      <SelectItem value="5">5 Devices</SelectItem>
                      <SelectItem value="10">10 Devices</SelectItem>
                      <SelectItem value="25">25 Devices</SelectItem>
                      <SelectItem value="50">50 Devices</SelectItem>
                      <SelectItem value="100">100 Devices</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createHashCode} disabled={isLoading || !newHashName.trim()}>
                  <Plus className="h-4 w-4 mr-2" /> Create
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Create a unique access link with device limit for a person or organization to view the deck.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Access Links</h2>
                <Button variant="outline" size="sm" onClick={fetchHashCodes} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
              </div>
              
              {isLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : hashCodes.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border border-dashed rounded-md">
                  No access links created yet. Create one above.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Device Limit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hashCodes.map((hashCode) => (
                      <TableRow key={hashCode.id}>
                        <TableCell className="font-medium">
                          {hashCode.name}
                        </TableCell>
                        <TableCell>
                          {new Date(hashCode.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{hashCode.devices.length}</TableCell>
                        <TableCell>
                          {editingHashId === hashCode.id ? (
                            <div className="flex gap-2 items-center">
                              <Select 
                                value={editMaxDevices} 
                                onValueChange={setEditMaxDevices}
                              >
                                <SelectTrigger className="w-24">
                                  <SelectValue placeholder="Limit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1">1</SelectItem>
                                  <SelectItem value="2">2</SelectItem>
                                  <SelectItem value="3">3</SelectItem>
                                  <SelectItem value="5">5</SelectItem>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="25">25</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                  <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                              </Select>
                              <div className="flex gap-1">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => updateMaxDevices(hashCode.id, parseInt(editMaxDevices, 10))}
                                >
                                  Save
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={cancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <span className="mr-2">{hashCode.maxDevices || 1}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0"
                                onClick={() => startEditMaxDevices(hashCode)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => copyHashLink(hashCode.hash)}
                            >
                              <Copy className="h-4 w-4 mr-2" /> Copy Link
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteHashCode(hashCode.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
            
            {hashCodes.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Viewing Devices</h2>
                {hashCodes.map((hashCode) => (
                  hashCode.devices.length > 0 && (
                    <div key={`devices-${hashCode.id}`} className="bg-white rounded-lg shadow-sm p-6 border">
                      <h3 className="font-medium mb-4">{hashCode.name}</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Location</TableHead>
                            <TableHead>IP Address</TableHead>
                            <TableHead>Device</TableHead>
                            <TableHead>Date/Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {hashCode.devices.map((device) => (
                            <TableRow key={device.id}>
                              <TableCell className="whitespace-nowrap">
                                {device.city && device.country 
                                  ? `${device.city}, ${device.country}` 
                                  : 'Unknown location'}
                              </TableCell>
                              <TableCell>{device.ipAddress}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                {device.userAgent}
                              </TableCell>
                              <TableCell>
                                {new Date(device.timestamp).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
