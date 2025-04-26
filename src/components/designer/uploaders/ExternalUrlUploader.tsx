
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface ExternalUrlUploaderProps {
  onImageSelect: (imageUrl: string) => void;
  onClose: () => void;
}

const ExternalUrlUploader: React.FC<ExternalUrlUploaderProps> = ({ onImageSelect, onClose }) => {
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
        onClose();
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
  
  return (
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
  );
};

export default ExternalUrlUploader;
