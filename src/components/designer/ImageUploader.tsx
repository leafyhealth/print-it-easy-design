import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, ImageIcon, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ensureStorageBucketExists } from '@/lib/setupStorage';

interface ImageUploaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageSelect: (imageUrl: string) => void;
  templateId?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  open,
  onOpenChange,
  onImageSelect,
  templateId
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recentImages, setRecentImages] = useState<string[]>([]);
  const [bucketReady, setBucketReady] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Setup bucket and load recent images when the dialog opens
  useEffect(() => {
    const setupBucket = async () => {
      if (open) {
        try {
          // Force bucket creation every time the uploader opens to ensure it exists
          const success = await ensureStorageBucketExists();
          setBucketReady(success);
          
          if (!success) {
            setUploadError("Storage not available. Please try again later.");
            toast({
              title: "Storage Setup Failed",
              description: "Unable to setup storage for uploads. You can still use external image URLs.",
              variant: "destructive"
            });
          } else {
            setUploadError(null);
            if (templateId) {
              await fetchRecentImages();
            }
          }
        } catch (error) {
          console.error("Error setting up storage:", error);
          setUploadError("Storage setup failed");
          toast({
            title: "Storage Error",
            description: "Could not set up storage for uploads. You can still use external image URLs.",
            variant: "destructive"
          });
        }
      }
    };
    
    setupBucket();
  }, [open, templateId]);

  const fetchRecentImages = async () => {
    try {
      const { data: imageElements, error } = await supabase
        .from('template_elements')
        .select('properties')
        .eq('type', 'image')
        .eq('template_id', templateId)
        .limit(5);
        
      if (error) throw error;
      
      // Extract unique image URLs
      const imageUrls = new Set<string>();
      imageElements?.forEach(element => {
        if (element.properties && typeof element.properties === 'object') {
          const props = element.properties as any;
          if (props.src && typeof props.src === 'string') {
            imageUrls.add(props.src);
          }
        }
      });
      
      setRecentImages(Array.from(imageUrls));
    } catch (error) {
      console.error('Error fetching recent images:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image less than 2MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      setUploadError(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload",
        variant: "destructive"
      });
      return;
    }
    
    if (!bucketReady) {
      // If bucket isn't ready, let the user know they can use an external URL instead
      toast({
        title: "Storage not ready",
        description: "We're experiencing issues with our storage system. Please use an external image URL instead.",
        variant: "destructive"
      });
      setUploadError("Storage not available. Please use an external URL instead.");
      return;
    }
    
    setUploading(true);
    setUploadError(null);
    
    try {
      console.log("Starting file upload...");
      // Force bucket creation once more right before upload
      const bucketExists = await ensureStorageBucketExists();
      
      if (!bucketExists) {
        throw new Error("Storage bucket is not available");
      }
      
      // Create filename
      const fileName = `${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;
      const filePath = `images/${fileName}`;
      
      console.log(`Uploading file to path: ${filePath}`);
      // Upload the file
      const { data, error } = await supabase.storage
        .from('template_assets')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) {
        console.error('Upload error details:', error);
        throw error;
      }
      
      console.log("Upload successful, getting public URL");
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('template_assets')
        .getPublicUrl(filePath);
        
      console.log("Public URL:", publicUrlData.publicUrl);
      
      // Call onImageSelect with the URL
      onImageSelect(publicUrlData.publicUrl);
      
      // Close the dialog
      onOpenChange(false);
      toast({
        title: "Image uploaded successfully",
        description: "The image has been added to your template."
      });
    } catch (error: any) {
      const errorMessage = error.message || "An error occurred during upload";
      setUploadError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive"
      });
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleExternalUrl = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const url = (form.elements.namedItem('imageUrl') as HTMLInputElement).value;
    
    if (url) {
      // Basic validation for image URL
      if (!url.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i)) {
        toast({
          title: "Invalid image URL",
          description: "Please enter a URL that points to an image file",
          variant: "destructive"
        });
        return;
      }
      
      // Test loading the image
      const img = new Image();
      img.onload = () => {
        onImageSelect(url);
        onOpenChange(false);
      };
      img.onerror = () => {
        toast({
          title: "Invalid image URL",
          description: "Could not load image from the URL provided",
          variant: "destructive"
        });
      };
      img.src = url;
    } else {
      toast({
        title: "URL required",
        description: "Please enter an image URL",
        variant: "destructive"
      });
    }
  };
  
  const handleSelectRecent = (imageUrl: string) => {
    onImageSelect(imageUrl);
    onOpenChange(false);
  };

  const handlePlaceholderImage = () => {
    const placeholderUrl = "https://via.placeholder.com/300x200?text=Placeholder+Image";
    onImageSelect(placeholderUrl);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Image</DialogTitle>
          <DialogDescription>
            Upload a new image or use an existing one
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4">
          {/* Upload from device section */}
          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Upload from your device</h3>
            <div className="grid gap-2">
              <div className="flex items-center justify-center w-full">
                <label 
                  htmlFor="file-upload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer ${
                    previewUrl ? 'border-transparent' : 'hover:bg-muted'
                  }`}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-6 w-6 mb-2 text-gray-500" />
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, or SVG (max 2MB)</p>
                    </div>
                  )}
                  <input 
                    id="file-upload"
                    type="file"
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </label>
              </div>
              
              {uploadError && (
                <div className="text-red-500 text-xs flex items-center gap-1 mt-1 bg-red-50 p-2 rounded">
                  <AlertCircle className="h-4 w-4" />
                  <span>{uploadError}</span>
                </div>
              )}
              
              {selectedFile && (
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading || !!uploadError}
                  className="w-full"
                >
                  {uploading ? 'Uploading...' : 'Upload Image'}
                </Button>
              )}
            </div>
          </div>

          {/* Use external URL section */}
          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Use image URL</h3>
            <form onSubmit={handleExternalUrl} className="grid gap-2">
              <Input 
                type="url" 
                name="imageUrl"
                placeholder="https://example.com/image.jpg" 
              />
              <Button type="submit" variant="outline" className="w-full">
                Use External Image
              </Button>
            </form>
          </div>
          
          {/* Placeholder image option */}
          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Quick placeholder</h3>
            <Button 
              onClick={handlePlaceholderImage} 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
            >
              <ImageIcon className="h-4 w-4" />
              Use Placeholder Image
            </Button>
          </div>
          
          {/* Recently used images */}
          {recentImages.length > 0 && (
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Recently used images</h3>
              <div className="grid grid-cols-3 gap-2">
                {recentImages.map((imageUrl, index) => (
                  <div 
                    key={index} 
                    onClick={() => handleSelectRecent(imageUrl)}
                    className="border rounded cursor-pointer hover:border-primary transition-colors p-1 h-20 flex items-center justify-center"
                  >
                    <img 
                      src={imageUrl} 
                      alt={`Recent ${index + 1}`} 
                      className="max-h-full max-w-full object-contain" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x60?text=Error';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploader;
