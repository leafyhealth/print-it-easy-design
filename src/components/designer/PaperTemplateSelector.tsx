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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from '@/components/ui/use-toast';

interface PaperTemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (templateSettings: {
    name: string;
    description: string;
    paperFormat: string;
    paperWidth: number;
    paperHeight: number;
    unit: string;
    labelLayout: string;
    columns: number;
    rows: number;
    labelWidth: number;
    labelHeight: number;
    horizontalGap?: number;
    verticalGap?: number;
    cornerRadius?: number;
  }) => void;
}

const PAPER_FORMATS = [
  { id: 'letter', label: 'Letter (8.5 x 11 in)', width: 8.5, height: 11, unit: 'in' },
  { id: 'a4', label: 'A4 (210 x 297 mm)', width: 210, height: 297, unit: 'mm' },
  { id: 'custom', label: 'Custom', width: 0, height: 0, unit: 'in' }
];

const LABEL_LAYOUTS = [
  { id: 'grid', label: 'Grid' },
  { id: 'single', label: 'Single' }
];

const UNITS = [
  { id: 'in', label: 'Inches' },
  { id: 'mm', label: 'Millimeters' }
];

const PaperTemplateSelector: React.FC<PaperTemplateSelectorProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [paperFormat, setPaperFormat] = useState(PAPER_FORMATS[0].id);
  const [paperWidth, setPaperWidth] = useState(PAPER_FORMATS[0].width);
  const [paperHeight, setPaperHeight] = useState(PAPER_FORMATS[0].height);
  const [unit, setUnit] = useState(PAPER_FORMATS[0].unit);
  const [labelLayout, setLabelLayout] = useState(LABEL_LAYOUTS[0].id);
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(10);
  const [labelWidth, setLabelWidth] = useState(2);
  const [labelHeight, setLabelHeight] = useState(1);
  const [horizontalGap, setHorizontalGap] = useState(0.1);
  const [verticalGap, setVerticalGap] = useState(0.1);
  const [cornerRadius, setCornerRadius] = useState(0);
  
  // Update paper dimensions when paper format changes
  useEffect(() => {
    const selectedFormat = PAPER_FORMATS.find(format => format.id === paperFormat);
    if (selectedFormat) {
      setPaperWidth(selectedFormat.width);
      setPaperHeight(selectedFormat.height);
      setUnit(selectedFormat.unit);
    }
  }, [paperFormat]);

  const handleSubmit = () => {
    if (!name) {
      toast({
        title: 'Template name is required',
        description: 'Please enter a name for the template.',
        variant: 'destructive'
      });
      return;
    }

    if (paperFormat === 'custom' && (!paperWidth || !paperHeight)) {
      toast({
        title: 'Paper dimensions are required',
        description: 'Please enter the width and height of the paper.',
        variant: 'destructive'
      });
      return;
    }

    if (labelLayout === 'grid' && (!columns || !rows || !labelWidth || !labelHeight)) {
      toast({
        title: 'Label dimensions are required',
        description: 'Please enter the number of columns and rows, and the width and height of the labels.',
        variant: 'destructive'
      });
      return;
    }
    
    const templateSettings = {
      name,
      description,
      paperFormat,
      paperWidth,
      paperHeight,
      unit,
      labelLayout,
      columns,
      rows,
      labelWidth,
      labelHeight,
      horizontalGap,
      verticalGap,
      cornerRadius
    };
    onConfirm(templateSettings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
          <DialogDescription>
            Define the paper and label settings for your template
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                type="text"
                id="name"
                placeholder="Template Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                type="text"
                id="description"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Paper Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="paperFormat">Paper Format</Label>
                <Select value={paperFormat} onValueChange={setPaperFormat}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAPER_FORMATS.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {paperFormat === 'custom' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="paperWidth">Width</Label>
                    <Input
                      type="number"
                      id="paperWidth"
                      placeholder="Width"
                      value={paperWidth}
                      onChange={(e) => setPaperWidth(Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="paperHeight">Height</Label>
                    <Input
                      type="number"
                      id="paperHeight"
                      placeholder="Height"
                      value={paperHeight}
                      onChange={(e) => setPaperHeight(Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {UNITS.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="text-sm font-medium mb-2">Label Settings</h3>
            <div className="grid gap-2">
              <Label>Label Layout</Label>
              <RadioGroup value={labelLayout} onValueChange={setLabelLayout} className="flex space-x-2">
                {LABEL_LAYOUTS.map((layout) => (
                  <div className="flex items-center space-x-2" key={layout.id}>
                    <RadioGroupItem value={layout.id} id={`label-layout-${layout.id}`} />
                    <Label htmlFor={`label-layout-${layout.id}`}>{layout.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {labelLayout === 'grid' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="columns">Columns</Label>
                    <Input
                      type="number"
                      id="columns"
                      placeholder="Columns"
                      value={columns}
                      onChange={(e) => setColumns(Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="rows">Rows</Label>
                    <Input
                      type="number"
                      id="rows"
                      placeholder="Rows"
                      value={rows}
                      onChange={(e) => setRows(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="labelWidth">Label Width ({unit})</Label>
                    <Input
                      type="number"
                      id="labelWidth"
                      placeholder="Label Width"
                      value={labelWidth}
                      onChange={(e) => setLabelWidth(Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="labelHeight">Label Height ({unit})</Label>
                    <Input
                      type="number"
                      id="labelHeight"
                      placeholder="Label Height"
                      value={labelHeight}
                      onChange={(e) => setLabelHeight(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="horizontalGap">Horizontal Gap ({unit})</Label>
                    <Input
                      type="number"
                      id="horizontalGap"
                      placeholder="Horizontal Gap"
                      value={horizontalGap}
                      onChange={(e) => setHorizontalGap(Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="verticalGap">Vertical Gap ({unit})</Label>
                    <Input
                      type="number"
                      id="verticalGap"
                      placeholder="Vertical Gap"
                      value={verticalGap}
                      onChange={(e) => setVerticalGap(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="grid gap-2 mt-4">
                  <Label htmlFor="cornerRadius">Corner Radius ({unit})</Label>
                  <Input
                    type="number"
                    id="cornerRadius"
                    placeholder="Corner Radius"
                    value={cornerRadius}
                    onChange={(e) => setCornerRadius(Number(e.target.value))}
                  />
                </div>
              </>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaperTemplateSelector;
