
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Define types for the element data
interface ElementPosition {
  x: number;
  y: number;
}

interface ElementSize {
  width: number;
  height: number;
}

interface ElementProperties {
  [key: string]: any;
}

interface ElementData {
  id?: string;
  name?: string;
  type?: string;
  position?: ElementPosition;
  size?: ElementSize;
  properties?: ElementProperties;
  rotation?: number;
  layer?: number;
  template_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper function to safely parse JSON or return default value
const safeParseJSON = (jsonString: string | null | undefined, defaultValue: any): any => {
  if (!jsonString) return defaultValue;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    return defaultValue;
  }
}

const ElementProperties = () => {
  const queryClient = useQueryClient();
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [accordionOpen, setAccordionOpen] = useState<{[key: string]: boolean}>({
    position: true,
    size: true,
    basic: true,
    advanced: false,
  });
  
  // Listen for element selection events
  useEffect(() => {
    const handleElementSelected = (event: Event) => {
      const customEvent = event as CustomEvent;
      setSelectedElementId(customEvent.detail.elementId || null);
      setActiveTab('basic');
    };
    
    document.addEventListener('element-selected', handleElementSelected);
    
    return () => {
      document.removeEventListener('element-selected', handleElementSelected);
    };
  }, []);
  
  // Fetch element data from Supabase
  const { data: elementData, isLoading } = useQuery({
    queryKey: ['element', selectedElementId],
    queryFn: async () => {
      if (!selectedElementId) return null;
      
      try {
        const { data, error } = await supabase
          .from('template_elements')
          .select('*')
          .eq('id', selectedElementId)
          .single();
          
        if (error) {
          console.error('Error fetching element:', error);
          throw error;
        }

        // Properly convert data to ElementData type
        const processedData: ElementData = {
          id: data.id,
          name: data.name,
          type: data.type,
          position: typeof data.position === 'string' 
            ? safeParseJSON(data.position, { x: 0, y: 0 }) 
            : data.position,
          size: typeof data.size === 'string' 
            ? safeParseJSON(data.size, { width: 100, height: 100 }) 
            : data.size,
          properties: typeof data.properties === 'string' 
            ? safeParseJSON(data.properties, {}) 
            : data.properties,
          rotation: data.rotation,
          layer: data.layer,
          template_id: data.template_id,
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        
        return processedData;
      } catch (error: any) {
        console.error('Error fetching element:', error);
        return null;
      }
    },
    enabled: !!selectedElementId,
  });
  
  // Mutation for updating element properties
  const updateElementMutation = useMutation({
    mutationFn: async ({ 
      elementId, 
      updates 
    }: { 
      elementId: string; 
      updates: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from('template_elements')
        .update(updates)
        .eq('id', elementId)
        .select()
        .single();
        
      if (error) {
        console.error('Error updating element:', error);
        throw error;
      }

      // Convert JSON strings to objects for the returned data
      const processedData: ElementData = {
        id: data.id,
        name: data.name,
        type: data.type,
        position: typeof data.position === 'string' 
          ? safeParseJSON(data.position, { x: 0, y: 0 }) 
          : data.position,
        size: typeof data.size === 'string' 
          ? safeParseJSON(data.size, { width: 100, height: 100 }) 
          : data.size,
        properties: typeof data.properties === 'string' 
          ? safeParseJSON(data.properties, {}) 
          : data.properties,
        rotation: data.rotation,
        layer: data.layer,
        template_id: data.template_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      
      return processedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['element', selectedElementId] });
      document.dispatchEvent(new CustomEvent('element-updated', {
        detail: { elementId: selectedElementId }
      }));
    },
    onError: (error) => {
      console.error('Error updating element:', error);
      toast({
        title: "Failed to update element",
        description: "There was an error updating the element properties.",
        variant: "destructive"
      });
    }
  });

  // Update a specific property
  const updateProperty = (propertyName: string, value: any) => {
    if (!selectedElementId || !elementData) return;
    
    const properties: ElementProperties = { 
      ...getElementProperties()
    };
    
    properties[propertyName] = value;
    
    updateElementMutation.mutate({ 
      elementId: selectedElementId, 
      updates: { properties } 
    });
  };
  
  // Update position
  const updatePosition = (axis: 'x' | 'y', value: number) => {
    if (!selectedElementId || !elementData) return;
    
    const position: ElementPosition = { 
      ...getElementPosition()
    };
    
    position[axis] = value;
    
    updateElementMutation.mutate({ 
      elementId: selectedElementId, 
      updates: { position } 
    });
  };
  
  // Update size
  const updateSize = (dimension: 'width' | 'height', value: number) => {
    if (!selectedElementId || !elementData) return;
    
    const size: ElementSize = { 
      ...getElementSize()
    };
    
    size[dimension] = value;
    
    updateElementMutation.mutate({ 
      elementId: selectedElementId, 
      updates: { size } 
    });
  };
  
  // Update element name
  const updateElementName = (name: string) => {
    if (!selectedElementId) return;
    
    updateElementMutation.mutate({ 
      elementId: selectedElementId, 
      updates: { name } 
    });
  };

  // Get parsed properties
  const getElementProperties = (): ElementProperties => {
    if (!elementData) return {};
    
    return (elementData.properties || {}) as ElementProperties;
  };
  
  // Get parsed position
  const getElementPosition = (): ElementPosition => {
    if (!elementData) return { x: 0, y: 0 };
    
    return (elementData.position || { x: 0, y: 0 }) as ElementPosition;
  };
  
  // Get parsed size
  const getElementSize = (): ElementSize => {
    if (!elementData) return { width: 100, height: 100 };
    
    return (elementData.size || { width: 100, height: 100 }) as ElementSize;
  };

  if (!selectedElementId) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select an element to view and edit its properties
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!elementData) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading element data. Please try again.
      </div>
    );
  }
  
  const elementProperties = getElementProperties();
  const elementPosition = getElementPosition();
  const elementSize = getElementSize();
  
  return (
    <div className="h-full overflow-y-auto p-1 text-sm">
      <Card className="mb-2">
        <CardHeader className="py-3">
          <CardTitle className="text-md">Element Properties</CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="elementName">Name</Label>
              <Input 
                id="elementName" 
                value={elementData.name || ''} 
                onChange={(e) => updateElementName(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Type</Label>
              <div className="text-gray-600 mt-1">{elementData.type}</div>
            </div>
            
            <Collapsible 
              open={accordionOpen.position} 
              onOpenChange={(isOpen) => setAccordionOpen({...accordionOpen, position: isOpen})}
              className="border rounded-md p-2"
            >
              <div className="flex justify-between items-center">
                <CollapsibleTrigger className="flex items-center text-sm font-medium hover:underline">
                  Position
                  {accordionOpen.position ? 
                    <ChevronUp className="h-4 w-4 ml-1" /> : 
                    <ChevronDown className="h-4 w-4 ml-1" />
                  }
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="pt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="posX">X</Label>
                    <Input 
                      id="posX" 
                      type="number" 
                      value={elementPosition.x} 
                      onChange={(e) => updatePosition('x', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="posY">Y</Label>
                    <Input 
                      id="posY" 
                      type="number" 
                      value={elementPosition.y} 
                      onChange={(e) => updatePosition('y', Number(e.target.value))}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible 
              open={accordionOpen.size} 
              onOpenChange={(isOpen) => setAccordionOpen({...accordionOpen, size: isOpen})}
              className="border rounded-md p-2"
            >
              <div className="flex justify-between items-center">
                <CollapsibleTrigger className="flex items-center text-sm font-medium hover:underline">
                  Size
                  {accordionOpen.size ? 
                    <ChevronUp className="h-4 w-4 ml-1" /> : 
                    <ChevronDown className="h-4 w-4 ml-1" />
                  }
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="pt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="width">Width</Label>
                    <Input 
                      id="width" 
                      type="number" 
                      value={elementSize.width} 
                      onChange={(e) => updateSize('width', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input 
                      id="height" 
                      type="number" 
                      value={elementSize.height} 
                      onChange={(e) => updateSize('height', Number(e.target.value))}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          
            {/* Type-specific properties */}
            {elementData.type === 'text' && (
              <>
                <div>
                  <Label htmlFor="text">Text Content</Label>
                  <Input 
                    id="text" 
                    value={elementProperties.text || ''} 
                    onChange={(e) => updateProperty('text', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Input 
                    id="fontSize" 
                    type="number" 
                    value={elementProperties.fontSize || 16} 
                    onChange={(e) => updateProperty('fontSize', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Select 
                    value={elementProperties.fontFamily || 'Arial'} 
                    onValueChange={(value) => updateProperty('fontFamily', value)}
                  >
                    <SelectTrigger id="fontFamily">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            {elementData.type === 'image' && (
              <div>
                <Label htmlFor="src">Image Source</Label>
                <Input 
                  id="src" 
                  value={elementProperties.src || ''} 
                  onChange={(e) => updateProperty('src', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Enter image URL or use the element uploader</p>
              </div>
            )}
            
            {elementData.type === 'barcode' && (
              <>
                <div>
                  <Label htmlFor="barcodeType">Barcode Type</Label>
                  <Select 
                    value={elementProperties.barcodeType || 'code128'} 
                    onValueChange={(value) => updateProperty('barcodeType', value)}
                  >
                    <SelectTrigger id="barcodeType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="code128">Code 128</SelectItem>
                      <SelectItem value="code39">Code 39</SelectItem>
                      <SelectItem value="ean13">EAN-13</SelectItem>
                      <SelectItem value="qrcode">QR Code</SelectItem>
                      <SelectItem value="datamatrix">Data Matrix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">Barcode Value</Label>
                  <Input 
                    id="value" 
                    value={elementProperties.value || ''} 
                    onChange={(e) => updateProperty('value', e.target.value)}
                  />
                </div>
              </>
            )}
            
            {elementData.type === 'shape' && (
              <div>
                <Label htmlFor="shapeType">Shape Type</Label>
                <Select 
                  value={elementProperties.shapeType || 'rectangle'} 
                  onValueChange={(value) => updateProperty('shapeType', value)}
                >
                  <SelectTrigger id="shapeType">
                    <SelectValue placeholder="Select shape" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rectangle">Rectangle</SelectItem>
                    <SelectItem value="ellipse">Ellipse</SelectItem>
                    <SelectItem value="line">Line</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElementProperties;
