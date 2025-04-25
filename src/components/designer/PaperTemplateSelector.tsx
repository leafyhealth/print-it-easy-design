
import React, { useState } from 'react';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Printer, FileText, ScrollText, Palette, Package, Scissors } from 'lucide-react';

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

// List of printers (would come from system in real implementation)
const PRINTERS = [
  { id: 'default', name: 'Default Printer' },
  { id: 'zebra', name: 'Zebra ZD410' },
  { id: 'dymo', name: 'DYMO LabelWriter 450' },
  { id: 'brother', name: 'Brother QL-800' },
];

// Label stock materials
const LABEL_STOCKS = [
  { id: 'plain', name: 'Plain Paper' },
  { id: 'glossy', name: 'Glossy' },
  { id: 'matte', name: 'Matte' },
  { id: 'transparent', name: 'Transparent' },
  { id: 'thermal', name: 'Thermal' },
];

// Processing order options
const PROCESSING_ORDERS = [
  { id: 'h-tl', name: 'Horizontally - start at top left' },
  { id: 'h-tr', name: 'Horizontally - start at top right' },
  { id: 'v-tl', name: 'Vertically - start at top left' },
  { id: 'v-tr', name: 'Vertically - start at top right' },
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
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    radius: {
      vertical: number;
      horizontal: number;
    };
    labelGap: {
      horizontal: number;
      vertical: number;
    };
    processingOrder: string;
    variableLabelSize: boolean;
    printer: string;
    stock: string;
    enableCutter: boolean;
  }) => void;
}

const PaperTemplateSelector: React.FC<PaperTemplateSelectorProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  const [currentTab, setCurrentTab] = useState("label-dimensions");
  
  // Basic settings
  const [paperFormat, setPaperFormat] = useState('a4');
  const [customWidth, setCustomWidth] = useState(0);
  const [customHeight, setCustomHeight] = useState(0);
  const [unit, setUnit] = useState('mm');
  const [labelLayout, setLabelLayout] = useState('2x3');
  const [customColumns, setCustomColumns] = useState(2);
  const [customRows, setCustomRows] = useState(3);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  // Extended settings
  const [printer, setPrinter] = useState('default');
  const [stock, setStock] = useState('plain');
  const [enableCutter, setEnableCutter] = useState(false);
  
  // Margins
  const [marginTop, setMarginTop] = useState(0);
  const [marginRight, setMarginRight] = useState(0);
  const [marginBottom, setMarginBottom] = useState(0);
  const [marginLeft, setMarginLeft] = useState(0);
  
  // Radius
  const [verticalRadius, setVerticalRadius] = useState(1);
  const [horizontalRadius, setHorizontalRadius] = useState(1);
  
  // Label gaps
  const [horizontalGap, setHorizontalGap] = useState(0);
  const [verticalGap, setVerticalGap] = useState(0);
  
  // Processing order
  const [processingOrder, setProcessingOrder] = useState('h-tl');
  
  // Variable label size
  const [variableLabelSize, setVariableLabelSize] = useState(false);

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
    const usableWidth = width - (margin * 2) - (horizontalGap * (columns - 1));
    const usableHeight = height - (margin * 2) - (verticalGap * (rows - 1));
    
    // Calculate label dimensions
    const labelWidth = (usableWidth / columns);
    const labelHeight = (usableHeight / rows);
    
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
      description,
      margins: {
        top: marginTop,
        right: marginRight,
        bottom: marginBottom,
        left: marginLeft
      },
      radius: {
        vertical: verticalRadius,
        horizontal: horizontalRadius
      },
      labelGap: {
        horizontal: horizontalGap,
        vertical: verticalGap
      },
      processingOrder,
      variableLabelSize,
      printer,
      stock,
      enableCutter
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Label Properties</DialogTitle>
          <DialogDescription>
            Configure your paper size and label layout
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-[200px_1fr] gap-6">
          {/* Left sidebar navigation */}
          <div className="space-y-1 border-r pr-4">
            <Button 
              variant={currentTab === "printer" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setCurrentTab("printer")}
            >
              <Printer className="mr-2 h-4 w-4" />
              Printer
            </Button>
            <Button 
              variant={currentTab === "label-dimensions" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setCurrentTab("label-dimensions")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Label Dimensions
            </Button>
            <Button 
              variant={currentTab === "paper" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setCurrentTab("paper")}
            >
              <ScrollText className="mr-2 h-4 w-4" />
              Paper
            </Button>
            <Button 
              variant={currentTab === "stocks" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setCurrentTab("stocks")}
            >
              <Palette className="mr-2 h-4 w-4" />
              Stocks
            </Button>
            <Button 
              variant={currentTab === "style" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setCurrentTab("style")}
            >
              <Package className="mr-2 h-4 w-4" />
              Style
            </Button>
            <Button 
              variant={currentTab === "batch-printing" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setCurrentTab("batch-printing")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Batch Printing
            </Button>
            <Button 
              variant={currentTab === "cutter" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setCurrentTab("cutter")}
            >
              <Scissors className="mr-2 h-4 w-4" />
              Cutter
            </Button>
            <Button 
              variant={currentTab === "info" ? "default" : "ghost"} 
              className="w-full justify-start" 
              onClick={() => setCurrentTab("info")}
            >
              <FileText className="mr-2 h-4 w-4" />
              Info
            </Button>
          </div>
          
          {/* Right content area */}
          <div className="flex-1 overflow-hidden">
            <div className="grid gap-6">
              {/* Printer Tab */}
              {currentTab === "printer" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="printer-select" className="text-right">Printer</Label>
                    <Select value={printer} onValueChange={setPrinter}>
                      <SelectTrigger id="printer-select" className="col-span-3">
                        <SelectValue placeholder="Select printer" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRINTERS.map(printer => (
                          <SelectItem key={printer.id} value={printer.id}>
                            {printer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              {/* Label Dimensions Tab */}
              {currentTab === "label-dimensions" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">Unit of measure:</Label>
                    <Select value={unit} onValueChange={setUnit}>
                      <SelectTrigger id="unit" className="col-span-3">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mm">Millimeters (mm)</SelectItem>
                        <SelectItem value="in">Inches (in)</SelectItem>
                        <SelectItem value="px">Pixels (px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Label Dimensions</h3>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="label-width" className="text-right">Width:</Label>
                      <div className="flex items-center gap-2 col-span-3">
                        <Input
                          id="label-width"
                          type="number"
                          value={getLabelDimensions().width.toFixed(2)}
                          step="0.01"
                          className="flex-1"
                          readOnly
                        />
                        <span>{unit}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4 mt-2">
                      <Label htmlFor="label-height" className="text-right">Height:</Label>
                      <div className="flex items-center gap-2 col-span-3">
                        <Input
                          id="label-height"
                          type="number"
                          value={getLabelDimensions().height.toFixed(2)}
                          step="0.01"
                          className="flex-1"
                          readOnly
                        />
                        <span>{unit}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Margins</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="margin-left" className="text-right">Left:</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="margin-left"
                            type="number"
                            value={marginLeft}
                            onChange={(e) => setMarginLeft(Number(e.target.value))}
                            step="0.01"
                            min="0"
                          />
                          <span>{unit}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="margin-top" className="text-right">Top:</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="margin-top"
                            type="number"
                            value={marginTop}
                            onChange={(e) => setMarginTop(Number(e.target.value))}
                            step="0.01"
                            min="0"
                          />
                          <span>{unit}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="margin-right" className="text-right">Right:</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="margin-right"
                            type="number"
                            value={marginRight}
                            onChange={(e) => setMarginRight(Number(e.target.value))}
                            step="0.01"
                            min="0"
                          />
                          <span>{unit}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="margin-bottom" className="text-right">Bottom:</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="margin-bottom"
                            type="number"
                            value={marginBottom}
                            onChange={(e) => setMarginBottom(Number(e.target.value))}
                            step="0.01"
                            min="0"
                          />
                          <span>{unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Radius</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="vertical-radius" className="text-right">Vertical radius:</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="vertical-radius"
                            type="number"
                            value={verticalRadius}
                            onChange={(e) => setVerticalRadius(Number(e.target.value))}
                            step="0.01"
                            min="0"
                          />
                          <span>{unit}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="horizontal-radius" className="text-right">Horizontal radius:</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="horizontal-radius"
                            type="number"
                            value={horizontalRadius}
                            onChange={(e) => setHorizontalRadius(Number(e.target.value))}
                            step="0.01"
                            min="0"
                          />
                          <span>{unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Labels Across</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="horizontal-count" className="text-right">Horizontal count:</Label>
                        <Input
                          id="horizontal-count"
                          type="number"
                          value={customColumns}
                          onChange={(e) => setCustomColumns(Number(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="horizontal-gap" className="text-right">Horizontal gap:</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="horizontal-gap"
                            type="number"
                            value={horizontalGap}
                            onChange={(e) => setHorizontalGap(Number(e.target.value))}
                            step="0.01"
                            min="0"
                          />
                          <span>{unit}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="vertical-count" className="text-right">Vertical count:</Label>
                        <Input
                          id="vertical-count"
                          type="number"
                          value={customRows}
                          onChange={(e) => setCustomRows(Number(e.target.value))}
                          min="1"
                        />
                      </div>
                      <div className="grid grid-cols-2 items-center gap-4">
                        <Label htmlFor="vertical-gap" className="text-right">Vertical gap:</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="vertical-gap"
                            type="number"
                            value={verticalGap}
                            onChange={(e) => setVerticalGap(Number(e.target.value))}
                            step="0.01"
                            min="0"
                          />
                          <span>{unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Processing order:</h3>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="col-span-1"></div>
                      <Select value={processingOrder} onValueChange={setProcessingOrder} className="col-span-3">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PROCESSING_ORDERS.map(order => (
                            <SelectItem key={order.id} value={order.id}>
                              {order.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Variable label size</h3>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="col-span-1"></div>
                      <div className="flex items-center gap-2 col-span-3">
                        <Checkbox 
                          id="variable-size" 
                          checked={variableLabelSize} 
                          onCheckedChange={(checked) => setVariableLabelSize(!!checked)} 
                        />
                        <Label htmlFor="variable-size">Enable variable label size</Label>
                      </div>
                    </div>
                    
                    {variableLabelSize && (
                      <div className="grid grid-cols-4 items-center gap-4 mt-2">
                        <Label htmlFor="offset" className="text-right">Offset:</Label>
                        <div className="flex items-center gap-2 col-span-3">
                          <Select defaultValue="---" disabled={!variableLabelSize}>
                            <SelectTrigger id="offset" className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="---">--- {unit}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Paper Tab */}
              {currentTab === "paper" && (
                <div className="space-y-4">
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
              )}

              {/* Stocks Tab */}
              {currentTab === "stocks" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="stock-material" className="text-right">Material</Label>
                    <Select value={stock} onValueChange={setStock}>
                      <SelectTrigger id="stock-material" className="col-span-3">
                        <SelectValue placeholder="Select stock material" />
                      </SelectTrigger>
                      <SelectContent>
                        {LABEL_STOCKS.map(stockItem => (
                          <SelectItem key={stockItem.id} value={stockItem.id}>
                            {stockItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              {/* Cutter Tab */}
              {currentTab === "cutter" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="col-span-1"></div>
                    <div className="flex items-center gap-2 col-span-3">
                      <Checkbox 
                        id="enable-cutter" 
                        checked={enableCutter} 
                        onCheckedChange={(checked) => setEnableCutter(!!checked)} 
                      />
                      <Label htmlFor="enable-cutter">Enable automatic cutting</Label>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Tab */}
              {currentTab === "info" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="template-name" className="text-right">Name</Label>
                    <Input
                      id="template-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="col-span-3"
                      placeholder="Template name"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="template-description" className="text-right">Description</Label>
                    <Input
                      id="template-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="col-span-3"
                      placeholder="Template description (optional)"
                    />
                  </div>
                </div>
              )}

              {/* Preview Panel */}
              <div className="bg-muted p-4 rounded-md mt-4">
                <h4 className="font-medium mb-2">Preview</h4>
                <div className="grid grid-cols-2">
                  <div>
                    <p>
                      <span className="font-medium">Paper:</span> {paperFormat !== 'custom' 
                        ? PAPER_FORMATS.find(f => f.id === paperFormat)?.name 
                        : `${customWidth} × ${customHeight} ${unit}`}
                    </p>
                    <p>
                      <span className="font-medium">Label Size:</span> {getLabelDimensions().width.toFixed(1)} × {getLabelDimensions().height.toFixed(1)} {paperFormat === 'custom' ? unit : PAPER_FORMATS.find(f => f.id === paperFormat)?.unit}
                    </p>
                  </div>
                  <div>
                    <p>
                      <span className="font-medium">Layout:</span> {getLabelDimensions().columns} × {getLabelDimensions().rows} labels per sheet
                    </p>
                    <p>
                      <span className="font-medium">Unit:</span> {unit}
                    </p>
                  </div>
                </div>
                
                <div className="border border-gray-300 rounded bg-gray-100 h-32 mt-4 flex items-center justify-center">
                  <div 
                    className="bg-white shadow-sm border"
                    style={{
                      width: '60%', 
                      height: '70%',
                      borderRadius: `${horizontalRadius}px ${horizontalRadius}px ${horizontalRadius}px ${horizontalRadius}px`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaperTemplateSelector;
