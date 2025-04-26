
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ShapeEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (shapeProperties: {
    shapeType: string;
    backgroundColor: string;
    borderWidth: number;
    borderStyle: string;
    borderColor: string;
  }) => void;
  initialProperties?: {
    shapeType?: string;
    backgroundColor?: string;
    borderWidth?: number;
    borderStyle?: string;
    borderColor?: string;
  };
}

const SHAPE_TYPES = [
  { id: 'rectangle', label: 'Rectangle' },
  { id: 'ellipse', label: 'Ellipse' },
  { id: 'line', label: 'Line' }
];

const BORDER_STYLES = [
  { id: 'solid', label: 'Solid' },
  { id: 'dashed', label: 'Dashed' },
  { id: 'dotted', label: 'Dotted' }
];

const ShapeEditor: React.FC<ShapeEditorProps> = ({
  open,
  onOpenChange,
  onSave,
  initialProperties = {}
}) => {
  const [shapeType, setShapeType] = useState(initialProperties.shapeType || 'rectangle');
  const [backgroundColor, setBackgroundColor] = useState(initialProperties.backgroundColor || '#FFFFFF');
  const [borderWidth, setBorderWidth] = useState(initialProperties.borderWidth || 1);
  const [borderStyle, setBorderStyle] = useState(initialProperties.borderStyle || 'solid');
  const [borderColor, setBorderColor] = useState(initialProperties.borderColor || '#000000');
  const [activeTab, setActiveTab] = useState('appearance');

  useEffect(() => {
    if (initialProperties.shapeType) setShapeType(initialProperties.shapeType);
    if (initialProperties.backgroundColor) setBackgroundColor(initialProperties.backgroundColor);
    if (initialProperties.borderWidth !== undefined) setBorderWidth(initialProperties.borderWidth);
    if (initialProperties.borderStyle) setBorderStyle(initialProperties.borderStyle);
    if (initialProperties.borderColor) setBorderColor(initialProperties.borderColor);
  }, [initialProperties]);

  const handleSave = () => {
    onSave({
      shapeType,
      backgroundColor,
      borderWidth,
      borderStyle,
      borderColor
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Shape</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-1">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Shape Type</Label>
              <Select value={shapeType} onValueChange={setShapeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHAPE_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex items-center space-x-2">
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

            <div className="space-y-2">
              <Label>Border Width (px)</Label>
              <Input 
                type="number"
                min="0"
                max="20"
                value={borderWidth}
                onChange={(e) => setBorderWidth(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Border Style</Label>
              <Select value={borderStyle} onValueChange={setBorderStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BORDER_STYLES.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Border Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="w-10 h-10 p-1"
                />
                <Input
                  type="text"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="border p-4 rounded-md">
              <div className="text-sm font-medium mb-2">Preview</div>
              <div
                className="flex items-center justify-center p-4 border rounded"
                style={{ height: '100px' }}
              >
                {shapeType === 'rectangle' && (
                  <div
                    style={{ 
                      width: '80px', 
                      height: '60px', 
                      backgroundColor,
                      border: `${borderWidth}px ${borderStyle} ${borderColor}`
                    }}
                  />
                )}
                {shapeType === 'ellipse' && (
                  <div
                    style={{ 
                      width: '80px', 
                      height: '60px', 
                      backgroundColor,
                      border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                      borderRadius: '50%'
                    }}
                  />
                )}
                {shapeType === 'line' && (
                  <div
                    style={{ 
                      width: '80px', 
                      height: `${borderWidth}px`,
                      backgroundColor: borderColor,
                      borderStyle
                    }}
                  />
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
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

export default ShapeEditor;
