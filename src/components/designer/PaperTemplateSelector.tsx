
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

// Common label layout presets
const LABEL_PRESETS = [
  { id: 'a4-30', label: 'A4 - 30 Labels (3 x 10)', format: 'a4', columns: 3, rows: 10, hGap: 2.5, vGap: 0 },
  { id: 'a4-24', label: 'A4 - 24 Labels (3 x 8)', format: 'a4', columns: 3, rows: 8, hGap: 3, vGap: 3 },
  { id: 'a4-21', label: 'A4 - 21 Labels (3 x 7)', format: 'a4', columns: 3, rows: 7, hGap: 2.5, vGap: 5 },
  { id: 'a4-12', label: 'A4 - 12 Labels (3 x 4)', format: 'a4', columns: 3, rows: 4, hGap: 8, vGap: 8 },
  { id: 'letter-30', label: 'Letter - 30 Labels (3 x 10)', format: 'letter', columns: 3, rows: 10, hGap: 0.1, vGap: 0 },
  { id: 'letter-24', label: 'Letter - 24 Labels (3 x 8)', format: 'letter', columns: 3, rows: 8, hGap: 0.15, vGap: 0.15 },
  { id: 'letter-12', label: 'Letter - 12 Labels (3 x 4)', format: 'letter', columns: 3, rows: 4, hGap: 0.2, vGap: 0.2 },
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
  const [horizontalGap, setHorizontalGap] = useState(0.1);
  const [verticalGap, setVerticalGap] = useState(0.1);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [labelWidth, setLabelWidth] = useState(0);
  const [labelHeight, setLabelHeight] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState('');
  
  // Update paper dimensions when paper format changes
  useEffect(() => {
    const selectedFormat = PAPER_FORMATS.find(format => format.id === paperFormat);
    if (selectedFormat) {
      setPaperWidth(selectedFormat.width);
      setPaperHeight(selectedFormat.height);
      setUnit(selectedFormat.unit);
    }
  }, [paperFormat]);

  // Auto-calculate label dimensions based on paper size, rows, columns, and gaps
  useEffect(() => {
    if (labelLayout === 'grid' && paperWidth && paperHeight) {
      let totalHorizontalGap = 0;
      let totalVerticalGap = 0;
      
      // Only consider gaps between labels if there are multiple columns/rows
      if (columns > 1) {
        totalHorizontalGap = horizontalGap * (columns - 1);
      }
      if (rows > 1) {
        totalVerticalGap = verticalGap * (rows - 1);
      }

      // Calculate margins (assuming 5% margin on each side)
      const horizontalMargin = paperWidth * 0.05 * 2;
      const verticalMargin = paperHeight * 0.05 * 2;

      // Calculate available space for labels
      const availableWidth = paperWidth - horizontalMargin - totalHorizontalGap;
      const availableHeight = paperHeight - verticalMargin - totalVerticalGap;

      // Calculate each label's dimensions
      const calcLabelWidth = availableWidth / columns;
      const calcLabelHeight = availableHeight / rows;

      // Round to 2 decimal places for better UX
      setLabelWidth(Math.round(calcLabelWidth * 100) / 100);
      setLabelHeight(Math.round(calcLabelHeight * 100) / 100);
    }
  }, [paperWidth, paperHeight, columns, rows, horizontalGap, verticalGap, labelLayout, unit]);

  // Apply label preset
  const applyPreset = (presetId: string) => {
    const preset = LABEL_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setPaperFormat(preset.format);
      setColumns(preset.columns);
      setRows(preset.rows);
      setHorizontalGap(preset.hGap);
      setVerticalGap(preset.vGap);
      setSelectedPreset(presetId);
    }
  };

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
      <DialogContent className="max-w-4xl">
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
            <div className="grid gap-4">
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
                  <div className="grid gap-2">
                    <Label>Common Label Presets</Label>
                    <Select value={selectedPreset} onValueChange={applyPreset}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a preset or customize below" />
                      </SelectTrigger>
                      <SelectContent>
                        {LABEL_PRESETS.filter(preset => 
                          preset.format === paperFormat || paperFormat === 'custom'
                        ).map((preset) => (
                          <SelectItem key={preset.id} value={preset.id}>
                            {preset.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="labelWidth">Label Width ({unit})</Label>
                      <Input
                        type="number"
                        id="labelWidth"
                        placeholder="Label Width"
                        value={labelWidth}
                        readOnly
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="labelHeight">Label Height ({unit})</Label>
                      <Input
                        type="number"
                        id="labelHeight"
                        placeholder="Label Height"
                        value={labelHeight}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <div className="grid gap-2">
                    <Label htmlFor="cornerRadius">Corner Radius ({unit})</Label>
                    <Input
                      type="number"
                      id="cornerRadius"
                      placeholder="Corner Radius"
                      value={cornerRadius}
                      onChange={(e) => setCornerRadius(Number(e.target.value))}
                    />
                  </div>

                  <div className="bg-gray-50 border rounded-md p-4 mt-2">
                    <h4 className="text-sm font-medium mb-2">Label Grid Preview</h4>
                    <div className="relative w-full aspect-[0.7] bg-white border border-gray-200 overflow-hidden">
                      {Array.from({ length: rows }).map((_, rowIndex) => (
                        <div key={`row-${rowIndex}`} className="flex" style={{ 
                          marginTop: rowIndex === 0 ? '5%' : `${verticalGap / paperHeight * 100}%`,
                          height: `${(labelHeight / paperHeight * 100)}%`,
                        }}>
                          {Array.from({ length: columns }).map((_, colIndex) => (
                            <div 
                              key={`cell-${rowIndex}-${colIndex}`} 
                              className="bg-blue-100 border border-blue-300 flex items-center justify-center text-xs"
                              style={{ 
                                marginLeft: colIndex === 0 ? '5%' : `${horizontalGap / paperWidth * 100}%`,
                                width: `${(labelWidth / paperWidth * 100)}%`,
                                borderRadius: `${cornerRadius / Math.min(labelWidth, labelHeight) * 100}%`
                              }}
                            >
                              {rowIndex === 0 && colIndex === 0 ? 'Design This Label' : ''}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      The preview shows the approximate layout. You'll design the first label, and it will be replicated across all positions.
                    </p>
                  </div>
                </>
              )}
            </div>
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
