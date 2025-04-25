
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from "@/components/ui/switch";

interface BarcodeEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (barcodeProperties: {
    content: string;
    barcodeType: string;
    showText: boolean;
    width: number;
    height: number;
    backgroundColor: string;
    foregroundColor: string;
  }) => void;
  initialProperties?: {
    content?: string;
    barcodeType?: string;
    showText?: boolean;
    width?: number;
    height?: number;
    backgroundColor?: string;
    foregroundColor?: string;
  };
}

const BARCODE_TYPES = [
  { id: 'code128', label: 'Code 128' },
  { id: 'code39', label: 'Code 39' },
  { id: 'ean13', label: 'EAN-13' },
  { id: 'ean8', label: 'EAN-8' },
  { id: 'upc', label: 'UPC' },
  { id: 'qr', label: 'QR Code' },
  { id: 'datamatrix', label: 'DataMatrix' }
];

const BarcodeEditor: React.FC<BarcodeEditorProps> = ({
  open,
  onOpenChange,
  onSave,
  initialProperties = {}
}) => {
  const [content, setContent] = useState(initialProperties.content || '123456789');
  const [barcodeType, setBarcodeType] = useState(initialProperties.barcodeType || 'code128');
  const [showText, setShowText] = useState(initialProperties.showText !== false);
  const [width, setWidth] = useState(initialProperties.width || 150);
  const [height, setHeight] = useState(initialProperties.height || 80);
  const [backgroundColor, setBackgroundColor] = useState(initialProperties.backgroundColor || '#ffffff');
  const [foregroundColor, setForegroundColor] = useState(initialProperties.foregroundColor || '#000000');

  // Update state when initialProperties change
  useEffect(() => {
    if (initialProperties.content) setContent(initialProperties.content);
    if (initialProperties.barcodeType) setBarcodeType(initialProperties.barcodeType);
    if (initialProperties.showText !== undefined) setShowText(initialProperties.showText);
    if (initialProperties.width) setWidth(initialProperties.width);
    if (initialProperties.height) setHeight(initialProperties.height);
    if (initialProperties.backgroundColor) setBackgroundColor(initialProperties.backgroundColor);
    if (initialProperties.foregroundColor) setForegroundColor(initialProperties.foregroundColor);
  }, [initialProperties]);

  const handleSave = () => {
    onSave({
      content,
      barcodeType,
      showText,
      width,
      height,
      backgroundColor,
      foregroundColor
    });
    onOpenChange(false);
  };

  const renderBarcodePreview = () => {
    // This is a placeholder. In a real implementation, we would use a proper barcode rendering library
    if (barcodeType === 'qr' || barcodeType === 'datamatrix') {
      return (
        <div 
          style={{ 
            width: '100px', 
            height: '100px', 
            backgroundColor: foregroundColor,
            position: 'relative',
            margin: '0 auto'
          }}
        >
          {/* Simulated QR code pattern */}
          <div style={{ 
            position: 'absolute', 
            width: '25%', 
            height: '25%', 
            top: '10%', 
            left: '10%', 
            backgroundColor: backgroundColor 
          }}></div>
          <div style={{ 
            position: 'absolute', 
            width: '15%', 
            height: '15%', 
            top: '50%', 
            left: '30%', 
            backgroundColor: backgroundColor 
          }}></div>
          <div style={{ 
            position: 'absolute', 
            width: '20%', 
            height: '30%', 
            top: '40%', 
            left: '60%', 
            backgroundColor: backgroundColor 
          }}></div>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div 
            style={{ 
              width: '150px', 
              height: '60px', 
              display: 'flex', 
              flexDirection: 'column',
              backgroundColor: backgroundColor,
              padding: '5px 0',
            }}
          >
            {/* Simulated barcode lines */}
            <div style={{ display: 'flex', height: '40px', justifyContent: 'space-between' }}>
              {Array.from({ length: 15 }).map((_, i) => (
                <div 
                  key={i} 
                  style={{ 
                    width: i % 5 === 0 ? '3px' : '1px', 
                    height: '100%', 
                    backgroundColor: foregroundColor,
                    marginRight: '3px'
                  }}
                ></div>
              ))}
            </div>
            
            {showText && (
              <div style={{ 
                textAlign: 'center', 
                marginTop: '5px', 
                fontSize: '12px',
                color: foregroundColor
              }}>
                {content}
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Barcode</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Barcode Content</Label>
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter barcode content"
            />
          </div>

          <div className="space-y-2">
            <Label>Barcode Type</Label>
            <Select value={barcodeType} onValueChange={setBarcodeType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BARCODE_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch 
              id="show-text"
              checked={showText}
              onCheckedChange={setShowText}
            />
            <Label htmlFor="show-text">Show text under barcode</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Width</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="50"
                  max="500"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
                <span>px</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Height</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="30"
                  max="300"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
                <span>px</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Barcode Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  type="text"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="border p-4 rounded-md">
            <div className="text-sm font-medium mb-2">Preview</div>
            <div className="p-2 border rounded flex items-center justify-center" style={{minHeight: '120px'}}>
              {renderBarcodePreview()}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeEditor;
