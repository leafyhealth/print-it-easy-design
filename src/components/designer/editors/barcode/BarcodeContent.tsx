
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BarcodeContentProps {
  content: string;
  setContent: (value: string) => void;
  barcodeType?: string;
  setBarcodeType?: (value: string) => void;
}

const BarcodeContent: React.FC<BarcodeContentProps> = ({
  content,
  setContent,
  barcodeType,
  setBarcodeType
}) => {
  return (
    <div className="space-y-4">
      {setBarcodeType && (
        <div className="space-y-2">
          <Label>Barcode Type</Label>
          <Select 
            value={barcodeType} 
            onValueChange={setBarcodeType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select barcode type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="code128">Code 128</SelectItem>
              <SelectItem value="qrcode">QR Code</SelectItem>
              <SelectItem value="ean13">EAN-13</SelectItem>
              <SelectItem value="upc">UPC</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-2">
        <Label>{barcodeType === 'qrcode' ? 'QR Code Content' : 'Barcode Content'}</Label>
        <Input 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={barcodeType === 'qrcode' ? 'https://example.com' : '123456789'}
        />
        {barcodeType === 'qrcode' && (
          <p className="text-xs text-muted-foreground">
            QR codes can store URLs, text, contact information, and more
          </p>
        )}
      </div>
    </div>
  );
};

export default BarcodeContent;
