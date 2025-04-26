
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface BarcodeAppearanceProps {
  showText: boolean;
  setShowText: (value: boolean) => void;
  width: number;
  setWidth: (value: number) => void;
  height: number;
  setHeight: (value: number) => void;
  foregroundColor: string;
  setForegroundColor: (value: string) => void;
  backgroundColor: string;
  setBackgroundColor: (value: string) => void;
  isQrCode: boolean;
}

const BarcodeAppearance: React.FC<BarcodeAppearanceProps> = ({
  showText,
  setShowText,
  width,
  setWidth,
  height,
  setHeight,
  foregroundColor,
  setForegroundColor,
  backgroundColor,
  setBackgroundColor,
  isQrCode
}) => {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Show Text</Label>
          <Switch 
            checked={showText} 
            onCheckedChange={setShowText} 
            disabled={isQrCode}
          />
        </div>
        {isQrCode && (
          <p className="text-xs text-muted-foreground">
            Text display is not available for QR codes
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Width (px)</Label>
          <Input 
            type="number"
            min="50"
            max="500"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Height (px)</Label>
          <Input 
            type="number"
            min="50"
            max="500"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Colors</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Foreground</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                type="color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="w-10 h-10 p-1"
              />
              <Input
                type="text"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <Label className="text-xs">Background</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-10 h-10 p-1"
              />
              <Input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BarcodeAppearance;
