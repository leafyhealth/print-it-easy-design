
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface ExternalUrlUploaderProps {
  onImageSelect: (imageUrl: string) => void;
  onClose: () => void;
}

const ExternalUrlUploader: React.FC<ExternalUrlUploaderProps> = ({ onImageSelect, onClose }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const validateImageUrl = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      
      const timer = setTimeout(() => {
        // If image takes too long to load, consider it failed
        img.src = '';
        resolve(false);
      }, 10000); // 10 second timeout
      
      img.onload = () => {
        clearTimeout(timer);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timer);
        resolve(false);
      };
      
      img.src = url;
    });
  };
  
  const handleExternalUrl = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setError(null);
    
    if (!url) {
      setError("Please enter an image URL");
      toast({
        title: "URL required",
        description: "Please enter an image URL",
        variant: "destructive"
      });
      return;
    }
    
    // Basic validation for image URL
    if (!url.match(/^(https?:\/\/)/i)) {
      setError("URL must start with http:// or https://");
      toast({
        title: "Invalid URL format",
        description: "URL must start with http:// or https://",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Test loading the image
      const isValidImage = await validateImageUrl(url);
      
      if (isValidImage) {
        onImageSelect(url);
        onClose();
        toast({
          title: "Image added",
          description: "External image has been added to your template."
        });
      } else {
        setError("Could not load image from the URL provided");
        toast({
          title: "Invalid image URL",
          description: "Could not load image from the URL provided",
          variant: "destructive"
        });
      }
    } catch (err) {
      setError("Error validating image URL");
      toast({
        title: "Error",
        description: "There was an error processing your request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="border rounded-md p-4">
      <h3 className="text-sm font-medium mb-2">Use image URL</h3>
      <form onSubmit={handleExternalUrl} className="grid gap-2">
        <Input 
          type="url" 
          name="imageUrl"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/image.jpg" 
        />
        
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        
        <Button 
          type="submit" 
          variant="outline" 
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Validating URL...
            </>
          ) : (
            'Use External Image'
          )}
        </Button>
      </form>
    </div>
  );
};

export default ExternalUrlUploader;
