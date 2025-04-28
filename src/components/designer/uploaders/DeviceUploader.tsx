
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ensureStorageBucketExists } from '@/lib/setupStorage';

interface DeviceUploaderProps {
  bucketReady: boolean;
  uploadError: string | null;
  setUploadError: (error: string | null) => void;
  onImageSelect: (imageUrl: string) => void;
  onClose: () => void;
}

const DeviceUploader: React.FC<DeviceUploaderProps> = ({
  bucketReady,
  uploadError,
  setUploadError,
  onImageSelect,
  onClose
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
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
      
      // Check file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp|svg\+xml)$/i)) {
        toast({
          title: "Invalid file type",
          description: "Please select a valid image file (JPEG, PNG, GIF, WebP, SVG)",
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
  
  const uploadWithFallback = async () => {
    if (!selectedFile) return null;
    
    try {
      // Try to use Supabase Storage if bucket is ready
      if (bucketReady) {
        console.log("Attempting Supabase upload...");
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
        return publicUrlData.publicUrl;
      }
      
      // Fallback to data URL if Supabase storage isn't available
      console.log("Falling back to data URL for image");
      return previewUrl;
    } catch (error) {
      console.error("Error in upload:", error);
      // Fallback to data URL if any error occurs
      console.log("Error occurred, falling back to data URL for image");
      return previewUrl;
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
    
    setUploading(true);
    setUploadError(null);
    
    try {
      console.log("Starting file upload...");
      // Force bucket creation once more right before upload
      const bucketExists = await ensureStorageBucketExists();
      
      // Upload with fallback strategy
      const imageUrl = await uploadWithFallback();
      
      if (!imageUrl) {
        throw new Error("Failed to get image URL after upload");
      }
      
      // Call onImageSelect with the URL
      onImageSelect(imageUrl);
      
      // Close the dialog
      onClose();
      
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
  
  return (
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
                <p className="text-xs text-gray-500">PNG, JPG, GIF, SVG, WebP (max 2MB)</p>
              </div>
            )}
            <input 
              id="file-upload"
              type="file"
              accept="image/jpeg, image/png, image/gif, image/webp, image/svg+xml" 
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
            disabled={uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DeviceUploader;
