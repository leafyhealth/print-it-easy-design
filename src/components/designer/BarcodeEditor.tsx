
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
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BarcodeEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (barcodeProperties: {
    content: string;
    barcodeType: string;
    showText: boolean;
    width: number;
    height: number;
    foregroundColor: string;
    backgroundColor: string;
    url?: string;
  }) => void;
  initialProperties?: {
    content?: string;
    barcodeType?: string;
    showText?: boolean;
    width?: number;
    height?: number;
    foregroundColor?: string;
    backgroundColor?: string;
    url?: string;
  };
}

const BARCODE_TYPES = [
  { id: 'code128', label: 'Code 128' },
  { id: 'code39', label: 'Code 39' },
  { id: 'ean13', label: 'EAN-13' },
  { id: 'qrcode', label: 'QR Code' },
  { id: 'datamatrix', label: 'Data Matrix' }
];

const BarcodeEditor: React.FC<BarcodeEditorProps> = ({
  open,
  onOpenChange,
  onSave,
  initialProperties = {}
}) => {
  const [content, setContent] = useState(initialProperties.content || '123456789');
  const [barcodeType, setBarcodeType] = useState(initialProperties.barcodeType || 'code128');
  const [showText, setShowText] = useState(initialProperties.showText !== false); // Default to true
  const [width, setWidth] = useState(initialProperties.width || 150);
  const [height, setHeight] = useState(initialProperties.height || 80);
  const [foregroundColor, setForegroundColor] = useState(initialProperties.foregroundColor || '#000000');
  const [backgroundColor, setBackgroundColor] = useState(initialProperties.backgroundColor || '#FFFFFF');
  const [url, setUrl] = useState(initialProperties.url || '');
  const [activeTab, setActiveTab] = useState('content');

  // Update state when initialProperties change
  useEffect(() => {
    if (initialProperties.content) setContent(initialProperties.content);
    if (initialProperties.barcodeType) setBarcodeType(initialProperties.barcodeType);
    if (initialProperties.showText !== undefined) setShowText(initialProperties.showText);
    if (initialProperties.width) setWidth(initialProperties.width);
    if (initialProperties.height) setHeight(initialProperties.height);
    if (initialProperties.foregroundColor) setForegroundColor(initialProperties.foregroundColor);
    if (initialProperties.backgroundColor) setBackgroundColor(initialProperties.backgroundColor);
    if (initialProperties.url) setUrl(initialProperties.url);
  }, [initialProperties]);

  const handleSave = () => {
    onSave({
      content,
      barcodeType,
      showText,
      width,
      height,
      foregroundColor,
      backgroundColor,
      url: url || undefined
    });
    onOpenChange(false);
  };

  const isQrCode = barcodeType === 'qrcode' || barcodeType === 'datamatrix';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Barcode</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4 mt-4">
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
            
            <div className="space-y-2">
              <Label>Barcode Content</Label>
              <Input 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isQrCode ? "QR content or URL" : "123456789"}
              />
              <p className="text-xs text-muted-foreground">
                {isQrCode 
                  ? "Enter text or a URL to encode in the QR code" 
                  : "Enter numbers or text for the barcode"}
              </p>
            </div>
            
            {isQrCode && (
              <div className="space-y-2 border-t pt-4">
                <Label>Link URL (Optional)</Label>
                <Input 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  When scanned, this URL will be opened. Leave empty if you don't want a link.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4 mt-4">
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
          </TabsContent>
        </Tabs>
        
        <div className="border p-4 rounded-md">
          <div className="text-sm font-medium mb-2">Preview</div>
          <div
            className="p-2 border rounded flex items-center justify-center"
            style={{ height: '100px', backgroundColor }}
          >
            {/* This is a simple representation - in a real app you'd render the actual barcode */}
            <div className="flex flex-col items-center">
              {barcodeType === 'qrcode' ? (
                <div
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    backgroundColor: foregroundColor,
                    clipPath: 'polygon(0% 0%, 0% 75%, 25% 75%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%)'
                  }}
                ></div>
              ) : (
                <>
                  <div style={{ 
                    width: '100px', 
                    height: '50px', 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div 
                        key={i} 
                        style={{ 
                          width: (i % 3 === 0) ? '4px' : '2px', 
                          height: '100%', 
                          backgroundColor: foregroundColor 
                        }}
                      ></div>
                    ))}
                  </div>
                  
                  {showText && !isQrCode && (
                    <div style={{ 
                      marginTop: '5px',
                      fontSize: '12px',
                      color: foregroundColor
                    }}>
                      {content || '123456789'}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeEditor;
