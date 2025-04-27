
import React from 'react';
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
  isUrl,
  setIsUrl,
  url,
  setUrl,
  content,
  setContent,
  qrStyle = 'classic',
  setQrStyle
}) => {
  return (
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
  );
};

export default QRCodeContent;
