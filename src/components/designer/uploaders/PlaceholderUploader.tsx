
import React from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';

interface PlaceholderUploaderProps {
  onImageSelect: (imageUrl: string) => void;
  onClose: () => void;
}

const PlaceholderUploader: React.FC<PlaceholderUploaderProps> = ({ onImageSelect, onClose }) => {
  // Using an Unsplash image instead of via.placeholder.com to avoid the ERR_NAME_NOT_RESOLVED error
  const handlePlaceholderImage = () => {
    const placeholderUrl = "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300&h=200&q=80";
    onImageSelect(placeholderUrl);
    onClose();
  };
  
  return (
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
  );
};

export default PlaceholderUploader;
