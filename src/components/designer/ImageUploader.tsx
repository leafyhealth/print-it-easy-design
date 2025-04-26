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
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { ensureStorageBucketExists } from '@/lib/setupStorage';
import DeviceUploader from './uploaders/DeviceUploader';
import ExternalUrlUploader from './uploaders/ExternalUrlUploader';
import PlaceholderUploader from './uploaders/PlaceholderUploader';
import RecentImagesGallery from './uploaders/RecentImagesGallery';
import { supabase } from '@/integrations/supabase/client';

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
  const [bucketReady, setBucketReady] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [recentImages, setRecentImages] = useState<string[]>([]);

  useEffect(() => {
    const setupBucket = async () => {
      if (open) {
        try {
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
          <DeviceUploader 
            bucketReady={bucketReady}
            uploadError={uploadError}
            setUploadError={setUploadError}
            onImageSelect={onImageSelect}
            onClose={() => onOpenChange(false)}
          />

          <ExternalUrlUploader 
            onImageSelect={onImageSelect}
            onClose={() => onOpenChange(false)}
          />
          
          <PlaceholderUploader
            onImageSelect={onImageSelect}
            onClose={() => onOpenChange(false)}
          />
          
          {recentImages.length > 0 && (
            <RecentImagesGallery
              images={recentImages}
              onImageSelect={(url) => {
                onImageSelect(url);
                onOpenChange(false);
              }}
            />
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
