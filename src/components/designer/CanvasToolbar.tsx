
import React from 'react';
import { Button } from '@/components/ui/button';
import { Text, Image, SquarePlus, Trash, Ruler, Grid3x3 } from 'lucide-react';
import ZoomControls from './ZoomControls';

interface CanvasToolbarProps {
  onAddText: () => void;
  onAddImage: () => void;
  onAddBarcode: () => void;
  onDeleteElement: () => void;
  hasSelectedElement: boolean;
  showRulers: boolean;
  onToggleRulers: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomFit: () => void;
  onZoomObjects: () => void;
}

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onAddText,
  onAddImage,
  onAddBarcode,
  onDeleteElement,
  hasSelectedElement,
  showRulers,
  onToggleRulers,
  showGrid,
  onToggleGrid,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  onZoomObjects
}) => {
  return (
    <div className="flex items-center justify-between p-2 border-b bg-gray-50">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onAddText}
          title="Add Text"
        >
          <Text size={16} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onAddImage}
          title="Add Image"
        >
          <Image size={16} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onAddBarcode}
          title="Add Barcode or QR Code"
        >
          <SquarePlus size={16} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onDeleteElement}
          title="Delete Selected Element"
          disabled={!hasSelectedElement}
        >
          <Trash size={16} />
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleRulers}
          className={showRulers ? 'bg-blue-100' : ''}
          title="Toggle Rulers"
        >
          <Ruler size={16} />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleGrid}
          className={showGrid ? 'bg-blue-100' : ''}
          title="Toggle Grid"
        >
          <Grid3x3 size={16} />
        </Button>
        
        <ZoomControls 
          zoomLevel={zoomLevel}
          onZoomChange={(level) => {}}
          onZoomFit={onZoomFit}
          onZoomObjects={onZoomObjects}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
        />
      </div>
    </div>
  );
};

export default CanvasToolbar;
