import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Link } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QRCodeContentProps {
  isUrl: boolean;
  setIsUrl: (value: boolean) => void;
  url: string;
  setUrl: (value: string) => void;
  content: string;
  setContent: (value: string) => void;
  qrStyle: string;
  setQrStyle: (value: string) => void;
}

const QRCodeContent: React.FC<QRCodeContentProps> = ({
  isUrl = false,
  setIsUrl,
  url = '',
  setUrl,
  content = '',
  setContent,
  qrStyle = 'classic',
  setQrStyle
}) => {
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    try {
      if (newUrl) {
        let urlToTest = newUrl;
        if (!newUrl.match(/^https?:\/\//i)) {
          urlToTest = `https://${newUrl}`;
        }
        new URL(urlToTest);
        setUrl(urlToTest);
      }
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch 
          id="url-mode" 
          checked={isUrl} 
          onCheckedChange={setIsUrl}
        />
        <Label htmlFor="url-mode" className="flex items-center gap-2">
          URL Mode <Link className="h-4 w-4" />
        </Label>
      </div>
      
      {isUrl ? (
        <div className="space-y-2">
          <Label>URL</Label>
          <Input 
            type="url"
            value={url}
            onChange={handleUrlChange}
            placeholder="https://example.com"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Enter a URL starting with http:// or https:// (will be auto-corrected if needed)
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
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="classic">Classic</SelectItem>
            <SelectItem value="rounded">Rounded Corners</SelectItem>
            <SelectItem value="colored">Custom Color</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default QRCodeContent;
