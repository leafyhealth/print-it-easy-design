
import React from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon } from 'lucide-react';

interface PlaceholderUploaderProps {
  onImageSelect: (imageUrl: string) => void;
  onClose: () => void;
}

const PlaceholderUploader: React.FC<PlaceholderUploaderProps> = ({ onImageSelect, onClose }) => {
  const handlePlaceholderImage = () => {
    const placeholderUrl = "https://via.placeholder.com/300x200?text=Placeholder+Image";
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
