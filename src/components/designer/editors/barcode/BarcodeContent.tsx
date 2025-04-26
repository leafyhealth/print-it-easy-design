
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BarcodeContentProps {
  content: string;
  setContent: (value: string) => void;
}

const BarcodeContent: React.FC<BarcodeContentProps> = ({
  content,
  setContent
}) => {
  return (
    <div className="space-y-2">
      <Label>Barcode Content</Label>
      <Input 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="123456789"
      />
    </div>
  );
};

export default BarcodeContent;
