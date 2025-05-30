
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ElementBase {
  id: string;
  type: 'text' | 'barcode' | 'image' | 'shape' | 'nutrition-facts';
  position: Position;
  size: Size;
  rotation: number;
  layer: number;
  name: string;
}

export interface TextElement extends ElementBase {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  textAlign: 'left' | 'center' | 'right';
  textDecoration: string;
  color: string;
}

export interface BarcodeElement extends ElementBase {
  type: 'barcode';
  barcodeType: 'qr' | 'code128' | 'ean13' | 'qrcode';
  content: string;
  showText: boolean;
  isUrl?: boolean;
  qrStyle?: 'classic' | 'rounded' | 'colored' | 'logo';
}

export interface ImageElement extends ElementBase {
  type: 'image';
  src: string;
  objectFit: 'contain' | 'cover' | 'fill';
}

export interface ShapeElement extends ElementBase {
  type: 'shape';
  shapeType: 'rectangle' | 'ellipse' | 'line';
  backgroundColor: string;
  borderWidth: number;
  borderStyle: string;
  borderColor: string;
}

export interface NutritionFactsElement extends ElementBase {
  type: 'nutrition-facts';
  data: {
    servingSize: string;
    servingsPerContainer: string;
    calories: number;
    totalFat: number;
    saturatedFat: number;
    transFat: number;
    cholesterol: number;
    sodium: number;
    totalCarbohydrate: number;
    dietaryFiber: number;
    sugars: number;
    addedSugars?: number;
    protein: number;
    vitaminD?: number;
    calcium?: number;
    iron?: number;
    potassium?: number;
  };
  style: {
    fontFamily: string;
    fontSize: number;
    headerFontSize: number;
    color: string;
    backgroundColor: string;
    borderColor: string;
  };
}

export type DesignElement = 
  | TextElement 
  | BarcodeElement 
  | ImageElement 
  | ShapeElement
  | NutritionFactsElement;

export interface GridSettings {
  showGrid?: boolean;
  gridSize?: number;
  paperFormat?: string;
  paperWidth?: number;
  paperHeight?: number;
  unit?: string;
  labelLayout?: string;
  columns?: number;
  rows?: number;
  labelWidth?: number;
  labelHeight?: number;
  horizontalGap?: number;
  verticalGap?: number;
  cornerRadius?: number;
}

export interface LabelTemplate {
  id: string;
  name: string;
  description: string;
  size: Size;
  elements: DesignElement[];
  gridSettings: GridSettings;
  lastModified: string;
}

export interface DataMapping {
  elementId: string;
  fieldName: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: 'csv' | 'database' | 'manual';
  fields: string[];
  data: Record<string, any>[];
}

export interface PrintSettings {
  printer: string;
  paperSize: string;
  orientation: 'portrait' | 'landscape';
  copies: number;
  dpi: number;
}

export interface TextEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  textProperties?: any;
  onSave: (textProperties: any) => void;
  content?: string; 
}
