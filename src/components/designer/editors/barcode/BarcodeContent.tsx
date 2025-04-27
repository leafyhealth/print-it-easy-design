
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface BarcodeContentProps {
  content: string;
  setContent: (value: string) => void;
  barcodeType?: string;
  setBarcodeType?: (value: string) => void;
}

const BarcodeContent: React.FC<BarcodeContentProps> = ({
  content,
  setContent,
  barcodeType = 'code128',
  setBarcodeType
}) => {
  // Helper function to provide placeholder text based on barcode type
  const getPlaceholder = () => {
    switch(barcodeType) {
      case 'qrcode':
        return 'https://example.com';
      case 'ean13':
        return '5901234123457';
      case 'upc':
        return '042100005264';
      case 'code128':
      default:
        return '123456789';
    }
  };

  // Helper function to provide content constraints based on barcode type
  const getHelperText = () => {
    switch(barcodeType) {
      case 'qrcode':
        return 'QR codes can store URLs, text, contact information, and more';
      case 'ean13':
        return 'EAN-13 requires exactly 12 digits (13th digit is a check digit)';
      case 'upc':
        return 'UPC-A requires exactly 11 digits (12th digit is a check digit)';
      case 'code128':
        return 'Code 128 can encode all 128 ASCII characters';
      default:
        return '';
    }
  };

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
          placeholder={getPlaceholder()}
        />
        <p className="text-xs text-muted-foreground">
          {getHelperText()}
        </p>
      </div>
      
      {barcodeType === 'qrcode' && (
        <>
          <Separator />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium mb-1">QR Code can contain:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>URLs (https://example.com)</li>
              <li>Text content</li>
              <li>Phone numbers (tel:+12345678901)</li>
              <li>Email addresses (mailto:example@example.com)</li>
              <li>SMS messages (sms:+12345678901?body=Hello)</li>
              <li>vCard contact information</li>
              <li>Wi-Fi network data</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default BarcodeContent;
