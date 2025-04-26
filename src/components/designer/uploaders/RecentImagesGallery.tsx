
import React from 'react';

interface RecentImagesGalleryProps {
  images: string[];
  onImageSelect: (imageUrl: string) => void;
}

const RecentImagesGallery: React.FC<RecentImagesGalleryProps> = ({ images, onImageSelect }) => {
  if (images.length === 0) {
    return null;
  }
  
  return (
    <div className="border rounded-md p-4">
      <h3 className="text-sm font-medium mb-2">Recently used images</h3>
      <div className="grid grid-cols-3 gap-2">
        {images.map((imageUrl, index) => (
          <div 
            key={index} 
            onClick={() => onImageSelect(imageUrl)}
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
  );
};

export default RecentImagesGallery;
