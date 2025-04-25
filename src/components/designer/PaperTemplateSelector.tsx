
import React from 'react';
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Standard paper formats
const PAPER_FORMATS = [
  { id: 'a4', name: 'A4 (210 × 297 mm)', width: 210, height: 297, unit: 'mm' },
  { id: 'a3', name: 'A3 (297 × 420 mm)', width: 297, height: 420, unit: 'mm' },
  { id: 'letter', name: 'US Letter (8.5 × 11 in)', width: 8.5, height: 11, unit: 'in' },
  { id: 'legal', name: 'US Legal (8.5 × 14 in)', width: 8.5, height: 14, unit: 'in' },
  { id: 'custom', name: 'Custom Size', width: 0, height: 0, unit: 'mm' }
];

// Common label layouts
const LABEL_LAYOUTS = [
  { id: '1x1', name: '1 label per sheet (1×1)' },
  { id: '2x3', name: '6 labels per sheet (2×3)' },
  { id: '3x4', name: '12 labels per sheet (3×4)' },
  { id: '4x5', name: '20 labels per sheet (4×5)' },
  { id: '5x6', name: '30 labels per sheet (5×6)' },
  { id: 'roll', name: 'Roll labels (continuous)' },
  { id: 'custom', name: 'Custom layout' }
];

interface PaperTemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (templateSettings: {
    paperFormat: string;
    paperWidth: number;
    paperHeight: number;
    unit: string;
    labelLayout: string;
    columns: number;
    rows: number;
    labelWidth: number;
    labelHeight: number;
    name: string;
    description: string;
  }) => void;
}

const PaperTemplateSelector: React.FC<PaperTemplateSelectorProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  const [paperFormat, setPaperFormat] = React.useState('a4');
  const [customWidth, setCustomWidth] = React.useState(0);
  const [customHeight, setCustomHeight] = React.useState(0);
  const [unit, setUnit] = React.useState('mm');
  const [labelLayout, setLabelLayout] = React.useState('2x3');
  const [customColumns, setCustomColumns] = React.useState(2);
  const [customRows, setCustomRows] = React.useState(3);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  // Calculate current paper dimensions
  const getPaperDimensions = () => {
    if (paperFormat === 'custom') {
      return { width: customWidth, height: customHeight, unit };
    }
    const format = PAPER_FORMATS.find(f => f.id === paperFormat);
    return { width: format?.width || 0, height: format?.height || 0, unit: format?.unit || 'mm' };
  };

  // Calculate label dimensions based on layout
  const getLabelDimensions = () => {
    const { width, height } = getPaperDimensions();
    
    // For roll labels, use the full width
    if (labelLayout === 'roll') {
      return { 
        width: width, 
        height: 50,  // Default height for roll labels
        columns: 1,
        rows: 1
      };
    }
    
    // Get columns and rows
    let columns = 2;
    let rows = 3;
    
    if (labelLayout === 'custom') {
      columns = customColumns;
      rows = customRows;
    } else if (labelLayout !== '1x1') {
      const [colsStr, rowsStr] = labelLayout.split('x');
      columns = parseInt(colsStr, 10);
      rows = parseInt(rowsStr, 10);
    } else {
      columns = 1;
      rows = 1;
    }
    
    // Add some margins/gaps between labels
    const margin = unit === 'mm' ? 5 : 0.2;
    const usableWidth = width - (margin * 2);
    const usableHeight = height - (margin * 2);
    
    // Calculate label dimensions
    const labelWidth = (usableWidth / columns) - (margin * (columns - 1) / columns);
    const labelHeight = (usableHeight / rows) - (margin * (rows - 1) / rows);
    
    return { 
      width: labelWidth, 
      height: labelHeight,
      columns,
      rows
    };
  };

  const handleConfirm = () => {
    const { width: paperWidth, height: paperHeight } = getPaperDimensions();
    const { width: labelWidth, height: labelHeight, columns, rows } = getLabelDimensions();
    
    if (!name) {
      alert("Please provide a template name");
      return;
    }
    
    onConfirm({
      paperFormat,
      paperWidth,
      paperHeight,
      unit,
      labelLayout,
      columns,
      rows,
      labelWidth,
      labelHeight,
      name,
      description
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Label Template</DialogTitle>
          <DialogDescription>
            Configure your paper size and label layout
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid gap-3">
            <h3 className="text-lg font-medium">Template Information</h3>
            <div className="grid gap-3">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="col-span-3"
                  placeholder="Template name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="col-span-3"
                  placeholder="Template description (optional)"
                />
              </div>
            </div>
          </div>
          
          <div className="grid gap-3">
            <h3 className="text-lg font-medium">Paper Size</h3>
            <div className="grid gap-3">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paper-format" className="text-right">Paper Format</Label>
                <Select 
                  value={paperFormat} 
                  onValueChange={setPaperFormat}
                >
                  <SelectTrigger id="paper-format" className="col-span-3">
                    <SelectValue placeholder="Select paper format" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAPER_FORMATS.map((format) => (
                      <SelectItem key={format.id} value={format.id}>
                        {format.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {paperFormat === 'custom' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">Unit</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger id="unit" className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm">Millimeters (mm)</SelectItem>
                        <SelectItem value="in">Inches (in)</SelectItem>
                        <SelectItem value="px">Pixels (px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="custom-width" className="text-right">Width</Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="custom-width"
                        type="number"
                        value={customWidth || ''}
                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span>{unit}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="custom-height" className="text-right">Height</Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="custom-height"
                        type="number"
                        value={customHeight || ''}
                        onChange={(e) => setCustomHeight(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span>{unit}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="grid gap-3">
            <h3 className="text-lg font-medium">Label Layout</h3>
            <div className="grid gap-3">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="label-layout" className="text-right">Layout</Label>
                <Select 
                  value={labelLayout}
                  onValueChange={setLabelLayout}
                >
                  <SelectTrigger id="label-layout" className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LABEL_LAYOUTS.map((layout) => (
                      <SelectItem key={layout.id} value={layout.id}>
                        {layout.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {labelLayout === 'custom' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="custom-columns" className="text-right">Columns</Label>
                    <Input
                      id="custom-columns"
                      type="number"
                      min="1"
                      max="10"
                      value={customColumns}
                      onChange={(e) => setCustomColumns(Number(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="custom-rows" className="text-right">Rows</Label>
                    <Input
                      id="custom-rows"
                      type="number"
                      min="1"
                      max="10"
                      value={customRows}
                      onChange={(e) => setCustomRows(Number(e.target.value))}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium mb-2">Preview</h4>
            <p>
              Paper: {paperFormat !== 'custom' 
                ? PAPER_FORMATS.find(f => f.id === paperFormat)?.name 
                : `${customWidth} × ${customHeight} ${unit}`}
            </p>
            <p>
              Label Size: {getLabelDimensions().width.toFixed(1)} × {getLabelDimensions().height.toFixed(1)} {paperFormat === 'custom' ? unit : PAPER_FORMATS.find(f => f.id === paperFormat)?.unit}
            </p>
            <p>
              Layout: {getLabelDimensions().columns} × {getLabelDimensions().rows} labels per sheet
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm}>Create Template</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaperTemplateSelector;
