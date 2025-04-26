
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Square
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  onZoomFit: () => void;
  onZoomObjects: () => void;
  // Adding these props to match usage in Canvas.tsx
  onZoomIn?: () => void; 
  onZoomOut?: () => void;
  onZoomReset?: () => void;
}

const ZOOM_PRESETS = [10, 25, 50, 75, 100, 125, 150, 200, 300, 400, 500];

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomLevel,
  onZoomChange,
  onZoomFit,
  onZoomObjects,
  onZoomIn: customZoomIn,
  onZoomOut: customZoomOut,
  onZoomReset
}) => {
  const handleZoomIn = () => {
    if (customZoomIn) {
      customZoomIn();
      return;
    }
    
    const currentIndex = ZOOM_PRESETS.findIndex(zoom => zoom >= zoomLevel);
    if (currentIndex < ZOOM_PRESETS.length - 1) {
      onZoomChange(ZOOM_PRESETS[currentIndex + 1]);
    }
  };

  const handleZoomOut = () => {
    if (customZoomOut) {
      customZoomOut();
      return;
    }
    
    const currentIndex = ZOOM_PRESETS.findIndex(zoom => zoom > zoomLevel) - 1;
    if (currentIndex >= 0) {
      onZoomChange(ZOOM_PRESETS[currentIndex]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleZoomOut}
              disabled={zoomLevel <= ZOOM_PRESETS[0]}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom Out</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Select
        value={zoomLevel.toString()}
        onValueChange={(value) => onZoomChange(Number(value))}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Zoom" />
        </SelectTrigger>
        <SelectContent>
          {ZOOM_PRESETS.map(zoom => (
            <SelectItem key={zoom} value={zoom.toString()}>
              {zoom}%
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleZoomIn}
              disabled={zoomLevel >= ZOOM_PRESETS[ZOOM_PRESETS.length - 1]}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom In</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onZoomFit}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom to Document</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={onZoomObjects}
            >
              <Square className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Zoom to Objects</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {onZoomReset && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onZoomReset}
              >
                <span className="text-xs">100%</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset Zoom</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default ZoomControls;
