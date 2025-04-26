import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
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
import { toast } from '@/components/ui/use-toast';

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
    qrStyle?: string;
    isUrl?: boolean;
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
    qrStyle?: string;
    isUrl?: boolean;
  };
}

const BARCODE_TYPES = [
  { id: 'qrcode', label: 'QR Code' },
  { id: 'code128', label: 'Code 128' },
  { id: 'code39', label: 'Code 39' },
  { id: 'ean13', label: 'EAN-13' },
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
  const [showText, setShowText] = useState(initialProperties.showText !== false);
  const [width, setWidth] = useState(initialProperties.width || 150);
  const [height, setHeight] = useState(initialProperties.height || 80);
  const [foregroundColor, setForegroundColor] = useState(initialProperties.foregroundColor || '#000000');
  const [backgroundColor, setBackgroundColor] = useState(initialProperties.backgroundColor || '#FFFFFF');
  const [url, setUrl] = useState(initialProperties.url || '');
  const [activeTab, setActiveTab] = useState('content');
  const [qrStyle, setQrStyle] = useState(initialProperties.qrStyle || 'classic');
  const [isUrl, setIsUrl] = useState(initialProperties.isUrl || false);

  useEffect(() => {
    if (initialProperties.content) setContent(initialProperties.content);
    if (initialProperties.barcodeType) setBarcodeType(initialProperties.barcodeType);
    if (initialProperties.showText !== undefined) setShowText(initialProperties.showText);
    if (initialProperties.width) setWidth(initialProperties.width);
    if (initialProperties.height) setHeight(initialProperties.height);
    if (initialProperties.foregroundColor) setForegroundColor(initialProperties.foregroundColor);
    if (initialProperties.backgroundColor) setBackgroundColor(initialProperties.backgroundColor);
    if (initialProperties.url) setUrl(initialProperties.url);
    if (initialProperties.qrStyle) setQrStyle(initialProperties.qrStyle);
    if (initialProperties.isUrl) setIsUrl(initialProperties.isUrl);
    
    if (initialProperties.barcodeType === 'qrcode' && initialProperties.content && 
        (initialProperties.content.startsWith('http://') || initialProperties.content.startsWith('https://'))) {
      setIsUrl(true);
      setUrl(initialProperties.content);
    }
  }, [initialProperties]);

  const validateUrl = (urlToValidate: string) => {
    if (!urlToValidate) return true;
    try {
      new URL(urlToValidate);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = () => {
    if (barcodeType === 'qrcode' && isUrl) {
      if (!url) {
        toast({
          title: 'URL Required',
          description: 'Please enter a URL for your QR code',
          variant: 'destructive'
        });
        return;
      }
      
      if (!validateUrl(url)) {
        toast({
          title: 'Invalid URL',
          description: 'Please enter a valid URL starting with http:// or https://',
          variant: 'destructive'
        });
        return;
      }
      
      onSave({
        content: url,
        barcodeType,
        showText: false,
        width,
        height,
        foregroundColor,
        backgroundColor,
        qrStyle,
        isUrl: true
      });
    } else {
      onSave({
        content,
        barcodeType,
        showText: showText && barcodeType !== 'qrcode' && barcodeType !== 'datamatrix',
        width,
        height,
        foregroundColor,
        backgroundColor,
        qrStyle: barcodeType === 'qrcode' ? qrStyle : undefined,
        isUrl: false
      });
    }
    
    onOpenChange(false);
  };

  const isQrCode = barcodeType === 'qrcode' || barcodeType === 'datamatrix';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure {barcodeType === 'qrcode' ? 'QR Code' : 'Barcode'}</DialogTitle>
          <DialogDescription>
            Customize your {barcodeType === 'qrcode' ? 'QR Code' : 'Barcode'} settings
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Type</Label>
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
            
            {barcodeType === 'qrcode' ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="url-mode" 
                    checked={isUrl} 
                    onCheckedChange={setIsUrl}
                  />
                  <Label htmlFor="url-mode">URL Mode</Label>
                </div>
                
                {isUrl ? (
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input 
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a URL starting with http:// or https://
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>QR Code Content</Label>
                    <Input 
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter text for QR code"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label>QR Style</Label>
                  <Select value={qrStyle} onValueChange={setQrStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="rounded">Rounded Corners</SelectItem>
                      <SelectItem value="colored">Custom Color</SelectItem>
                      <SelectItem value="logo">With Logo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Barcode Content</Label>
                <Input 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="123456789"
                />
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
            {barcodeType === 'qrcode' ? (
              <div className="w-20 h-20 flex items-center justify-center">
                <div
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    backgroundColor: foregroundColor,
                    clipPath: qrStyle === 'rounded' 
                      ? 'polygon(0% 0%, 0% 75%, 25% 75%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%)'
                      : 'polygon(0% 0%, 0% 75%, 25% 75%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%)',
                    borderRadius: qrStyle === 'rounded' ? '8px' : '0px'
                  }}
                >
                  {qrStyle === 'logo' && (
                    <div className="w-6 h-6 bg-white absolute"></div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
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
              </div>
            )}
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
