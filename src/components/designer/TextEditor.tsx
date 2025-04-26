
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
import { TextEditorProps } from '@/types/designer';

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
  textProperties = {},
  onSave,
  content
}) => {
  const [textContent, setTextContent] = useState(content || textProperties.content || 'Sample Text');
  const [fontFamily, setFontFamily] = useState(textProperties.fontFamily || 'Arial');
  const [fontSize, setFontSize] = useState(textProperties.fontSize || 16);
  const [fontWeight, setFontWeight] = useState(textProperties.fontWeight || 'normal');
  const [fontStyle, setFontStyle] = useState(textProperties.fontStyle || 'normal');
  const [textAlign, setTextAlign] = useState(textProperties.textAlign || 'left');
  const [textDecoration, setTextDecoration] = useState(textProperties.textDecoration || 'none');
  const [color, setColor] = useState(textProperties.color || '#000000');

  // Update state when textProperties change
  useEffect(() => {
    if (textProperties.content) setTextContent(textProperties.content);
    if (textProperties.fontFamily) setFontFamily(textProperties.fontFamily);
    if (textProperties.fontSize) setFontSize(textProperties.fontSize);
    if (textProperties.fontWeight) setFontWeight(textProperties.fontWeight);
    if (textProperties.fontStyle) setFontStyle(textProperties.fontStyle);
    if (textProperties.textAlign) setTextAlign(textProperties.textAlign);
    if (textProperties.textDecoration) setTextDecoration(textProperties.textDecoration);
    if (textProperties.color) setColor(textProperties.color);
  }, [textProperties]);

  const handleSave = () => {
    onSave({
      content: textContent,
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
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
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
              {textContent || 'Sample Text'}
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
