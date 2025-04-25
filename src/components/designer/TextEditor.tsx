
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface TextEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (textProperties: {
    content: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fontStyle: string;
    textAlign: string;
    textDecoration: string;
    color: string;
  }) => void;
  initialProperties?: {
    content?: string;
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    fontStyle?: string;
    textAlign?: string;
    textDecoration?: string;
    color?: string;
  };
}

const FONT_FAMILIES = [
  'Arial', 
  'Helvetica', 
  'Times New Roman', 
  'Courier New', 
  'Georgia', 
  'Verdana', 
  'Impact'
];

const TEXT_ALIGNS = [
  { id: 'left', label: 'Left' },
  { id: 'center', label: 'Center' },
  { id: 'right', label: 'Right' },
  { id: 'justify', label: 'Justify' }
];

const FONT_WEIGHTS = [
  { id: 'normal', label: 'Normal' },
  { id: 'bold', label: 'Bold' }
];

const FONT_STYLES = [
  { id: 'normal', label: 'Normal' },
  { id: 'italic', label: 'Italic' }
];

const TEXT_DECORATIONS = [
  { id: 'none', label: 'None' },
  { id: 'underline', label: 'Underline' }
];

const TextEditor: React.FC<TextEditorProps> = ({
  open,
  onOpenChange,
  onSave,
  initialProperties = {}
}) => {
  const [content, setContent] = useState(initialProperties.content || 'Sample Text');
  const [fontFamily, setFontFamily] = useState(initialProperties.fontFamily || 'Arial');
  const [fontSize, setFontSize] = useState(initialProperties.fontSize || 16);
  const [fontWeight, setFontWeight] = useState(initialProperties.fontWeight || 'normal');
  const [fontStyle, setFontStyle] = useState(initialProperties.fontStyle || 'normal');
  const [textAlign, setTextAlign] = useState(initialProperties.textAlign || 'left');
  const [textDecoration, setTextDecoration] = useState(initialProperties.textDecoration || 'none');
  const [color, setColor] = useState(initialProperties.color || '#000000');

  // Update state when initialProperties change
  useEffect(() => {
    if (initialProperties.content) setContent(initialProperties.content);
    if (initialProperties.fontFamily) setFontFamily(initialProperties.fontFamily);
    if (initialProperties.fontSize) setFontSize(initialProperties.fontSize);
    if (initialProperties.fontWeight) setFontWeight(initialProperties.fontWeight);
    if (initialProperties.fontStyle) setFontStyle(initialProperties.fontStyle);
    if (initialProperties.textAlign) setTextAlign(initialProperties.textAlign);
    if (initialProperties.textDecoration) setTextDecoration(initialProperties.textDecoration);
    if (initialProperties.color) setColor(initialProperties.color);
  }, [initialProperties]);

  const handleSave = () => {
    onSave({
      content,
      fontFamily,
      fontSize,
      fontWeight,
      fontStyle,
      textAlign,
      textDecoration,
      color
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Text</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Text Content</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="8"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                />
                <span>px</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Font Weight</Label>
              <Select value={fontWeight} onValueChange={setFontWeight}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_WEIGHTS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Style</Label>
              <Select value={fontStyle} onValueChange={setFontStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_STYLES.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Text Align</Label>
              <Select value={textAlign} onValueChange={setTextAlign}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_ALIGNS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Text Decoration</Label>
              <Select value={textDecoration} onValueChange={setTextDecoration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEXT_DECORATIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="border p-4 rounded-md">
            <div className="text-sm font-medium mb-2">Preview</div>
            <div
              style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                fontWeight,
                fontStyle,
                textAlign: textAlign as any,
                textDecoration,
                color
              }}
              className="p-2 border rounded min-h-[60px]"
            >
              {content || 'Sample Text'}
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

export default TextEditor;
