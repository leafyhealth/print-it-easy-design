
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Grid3x3, 
  Ruler, 
  Maximize2, 
  AlignEndHorizontal,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndVertical,
  AlignStartVertical,
  AlignCenterVertical,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VisualAidToolsProps {
  showGrid: boolean;
  showRulers: boolean;
  showSnaplines: boolean;
  showMargins: boolean;
  onToggleGrid: () => void;
  onToggleRulers: () => void;
  onToggleSnaplines: () => void;
  onToggleMargins: () => void;
  onAlignHorizontal: (position: 'start' | 'center' | 'end') => void;
  onAlignVertical: (position: 'start' | 'center' | 'end') => void;
}

const VisualAidTools: React.FC<VisualAidToolsProps> = ({
  showGrid,
  showRulers,
  showSnaplines,
  showMargins,
  onToggleGrid,
  onToggleRulers,
  onToggleSnaplines,
  onToggleMargins,
  onAlignHorizontal,
  onAlignVertical,
}) => {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="flex items-center space-x-2">
        <Switch 
          id="grid-toggle" 
          checked={showGrid} 
          onCheckedChange={onToggleGrid} 
        />
        <Label htmlFor="grid-toggle" className="cursor-pointer">Grid</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          id="rulers-toggle" 
          checked={showRulers} 
          onCheckedChange={onToggleRulers} 
        />
        <Label htmlFor="rulers-toggle" className="cursor-pointer">Rulers</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          id="snaplines-toggle" 
          checked={showSnaplines} 
          onCheckedChange={onToggleSnaplines} 
        />
        <Label htmlFor="snaplines-toggle" className="cursor-pointer">Snaplines</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          id="margins-toggle" 
          checked={showMargins} 
          onCheckedChange={onToggleMargins} 
        />
        <Label htmlFor="margins-toggle" className="cursor-pointer">Margins</Label>
      </div>
      
      <Separator orientation="vertical" className="h-6" />
      
      <div className="flex items-center space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onAlignHorizontal('start')}
              >
                <AlignStartHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Left</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onAlignHorizontal('center')}
              >
                <AlignCenterHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Center</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onAlignHorizontal('end')}
              >
                <AlignEndHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Right</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex items-center space-x-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onAlignVertical('start')}
              >
                <AlignStartVertical className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Top</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onAlignVertical('center')}
              >
                <AlignCenterVertical className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Middle</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => onAlignVertical('end')}
              >
                <AlignEndVertical className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Align Bottom</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default VisualAidTools;
