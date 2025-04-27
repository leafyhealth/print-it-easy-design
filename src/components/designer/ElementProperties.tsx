
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ElementProperties = () => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [elementType, setElementType] = useState<string | null>(null);
  const [elementData, setElementData] = useState<any>(null);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const handleElementSelected = (event: Event) => {
      const customEvent = event as CustomEvent;
      setSelectedElement(customEvent.detail.elementId);
    };

    const handleElementDeselected = () => {
      setSelectedElement(null);
      setElementType(null);
      setElementData(null);
    };

    document.addEventListener('element-selected', handleElementSelected);
    document.addEventListener('element-deselected', handleElementDeselected);

    return () => {
      document.removeEventListener('element-selected', handleElementSelected);
      document.removeEventListener('element-deselected', handleElementDeselected);
    };
  }, []);

  const { data: element } = useQuery({
    queryKey: ['element', selectedElement],
    queryFn: async () => {
      if (!selectedElement) return null;
      
      const { data, error } = await supabase
        .from('template_elements')
        .select('*')
        .eq('id', selectedElement)
        .single();
        
      if (error) {
        console.error('Error fetching element:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!selectedElement,
    onSuccess: (data) => {
      if (data) {
        setElementType(data.type);
        setElementData(data);
      }
    }
  });
  
  const updateElementMutation = useMutation({
    mutationFn: async ({ 
      id, 
      updates
    }: { 
      id: string, 
      updates: Partial<any>
    }) => {
      const { data, error } = await supabase
        .from('template_elements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['element', selectedElement],
      });
      queryClient.invalidateQueries({
        queryKey: ['template-elements'],
      });
    }
  });
  
  const handleTextUpdate = (field: string, value: any) => {
    if (!selectedElement || !elementData) return;
    
    const properties = { ...elementData.properties };
    properties[field] = value;
    
    updateElementMutation.mutate({
      id: selectedElement,
      updates: { properties }
    });
  };
  
  const handlePositionSizeUpdate = (field: string, value: any) => {
    if (!selectedElement || !elementData) return;
    
    let updates: any = {};
    
    if (['x', 'y'].includes(field)) {
      const position = { ...(elementData.position || {}) };
      position[field] = Number(value);
      updates.position = position;
    } else if (['width', 'height'].includes(field)) {
      const size = { ...(elementData.size || {}) };
      size[field] = Number(value);
      updates.size = size;
    }
    
    updateElementMutation.mutate({
      id: selectedElement,
      updates
    });
  };

  if (!selectedElement || !elementData) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select an element to edit its properties
      </div>
    );
  }
  
  const properties = elementData.properties || {};
  const position = elementData.position || { x: 0, y: 0 };
  const size = elementData.size || { width: 100, height: 100 };

  if (elementType === 'text') {
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="content">Text Content</Label>
          <Input 
            id="content" 
            value={properties.content || ''} 
            onChange={(e) => handleTextUpdate('content', e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="font-family">Font</Label>
          <select 
            id="font-family" 
            className="w-full px-3 py-2 bg-background border rounded-md"
            value={properties.fontFamily || 'Arial'}
            onChange={(e) => handleTextUpdate('fontFamily', e.target.value)}
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Verdana">Verdana</option>
            <option value="Georgia">Georgia</option>
            <option value="Tahoma">Tahoma</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="font-size">Font Size</Label>
            <span className="text-sm">{properties.fontSize || 12}pt</span>
          </div>
          <Slider
            id="font-size"
            value={[properties.fontSize || 12]}
            max={72}
            min={6}
            step={1}
            onValueChange={(value) => handleTextUpdate('fontSize', value[0])}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="x-pos">X Position</Label>
            <Input 
              id="x-pos" 
              value={position.x} 
              type="number"
              onChange={(e) => handlePositionSizeUpdate('x', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="y-pos">Y Position</Label>
            <Input 
              id="y-pos" 
              value={position.y} 
              type="number"
              onChange={(e) => handlePositionSizeUpdate('y', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="width">Width</Label>
            <Input 
              id="width" 
              value={size.width} 
              type="number"
              onChange={(e) => handlePositionSizeUpdate('width', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="height">Height</Label>
            <Input 
              id="height" 
              value={size.height} 
              type="number"
              onChange={(e) => handlePositionSizeUpdate('height', e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="style">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          <TabsContent value="style" className="space-y-3 pt-2">
            <div>
              <Label className="mb-2 block">Text Style</Label>
              <ToggleGroup type="multiple" className="justify-start">
                <ToggleGroupItem 
                  value="bold" 
                  aria-label="Toggle bold"
                  data-state={properties.fontWeight === 'bold' ? 'on' : 'off'}
                  onClick={() => handleTextUpdate('fontWeight', properties.fontWeight === 'bold' ? 'normal' : 'bold')}
                >
                  <Bold className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="italic" 
                  aria-label="Toggle italic"
                  data-state={properties.fontStyle === 'italic' ? 'on' : 'off'}
                  onClick={() => handleTextUpdate('fontStyle', properties.fontStyle === 'italic' ? 'normal' : 'italic')}
                >
                  <Italic className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="underline" 
                  aria-label="Toggle underline"
                  data-state={properties.textDecoration === 'underline' ? 'on' : 'off'}
                  onClick={() => handleTextUpdate('textDecoration', properties.textDecoration === 'underline' ? 'none' : 'underline')}
                >
                  <Underline className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            <div>
              <Label className="mb-2 block">Alignment</Label>
              <ToggleGroup type="single" value={properties.textAlign || 'left'}>
                <ToggleGroupItem 
                  value="left" 
                  aria-label="Left align"
                  onClick={() => handleTextUpdate('textAlign', 'left')}
                >
                  <AlignLeft className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="center" 
                  aria-label="Center align"
                  onClick={() => handleTextUpdate('textAlign', 'center')}
                >
                  <AlignCenter className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="right" 
                  aria-label="Right align"
                  onClick={() => handleTextUpdate('textAlign', 'right')}
                >
                  <AlignRight className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            
            <div>
              <Label>Color</Label>
              <div className="flex mt-1 space-x-2">
                {['#000000', '#FF0000', '#0000FF', '#008000', '#9370DB'].map(color => (
                  <div 
                    key={color}
                    className={`w-8 h-8 rounded-full border cursor-pointer ${properties.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleTextUpdate('color', color)}
                  ></div>
                ))}
                <input
                  type="color"
                  value={properties.color || '#000000'}
                  onChange={(e) => handleTextUpdate('color', e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="pt-2">
            <div className="space-y-2">
              <Label>Data Source</Label>
              <select className="w-full px-3 py-2 bg-background border rounded-md">
                <option>Static Text</option>
                <option>Database Field</option>
                <option>Formula</option>
              </select>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="pt-2">
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="checkbox" id="rotation-enabled" className="mr-2" />
                <Label htmlFor="rotation-enabled">Enable Rotation</Label>
              </div>
              <div className="flex justify-between">
                <Label htmlFor="rotation">Rotation</Label>
                <span className="text-sm">{elementData.rotation || 0}°</span>
              </div>
              <Slider
                id="rotation"
                defaultValue={[elementData.rotation || 0]}
                max={360}
                min={0}
                step={1}
                disabled={true}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  } else if (elementType === 'image') {
    return (
      <div className="space-y-4 p-4">
        <div className="text-center mb-4">
          <div className="border rounded p-2 mb-2 bg-gray-50">
            <img 
              src={properties.src} 
              alt={elementData.name} 
              className="max-h-40 mx-auto object-contain"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => document.dispatchEvent(new CustomEvent('edit-image-element', { detail: { elementId: selectedElement } }))}
          >
            Change Image
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="x-pos">X Position</Label>
            <Input 
              id="x-pos" 
              value={position.x} 
              type="number"
              onChange={(e) => handlePositionSizeUpdate('x', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="y-pos">Y Position</Label>
            <Input 
              id="y-pos" 
              value={position.y} 
              type="number"
              onChange={(e) => handlePositionSizeUpdate('y', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="width">Width</Label>
            <Input 
              id="width" 
              value={size.width} 
              type="number"
              onChange={(e) => handlePositionSizeUpdate('width', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="height">Height</Label>
            <Input 
              id="height" 
              value={size.height} 
              type="number"
              onChange={(e) => handlePositionSizeUpdate('height', e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="object-fit">Object Fit</Label>
          <select 
            id="object-fit" 
            className="w-full px-3 py-2 bg-background border rounded-md"
            value={properties.objectFit || 'contain'}
            onChange={(e) => handleTextUpdate('objectFit', e.target.value)}
          >
            <option value="contain">Contain</option>
            <option value="cover">Cover</option>
            <option value="fill">Fill</option>
          </select>
        </div>
      </div>
    );
  } else if (elementType === 'barcode') {
    return (
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="barcode-content">Barcode Content</Label>
          <Input 
            id="barcode-content" 
            value={properties.content || ''} 
            onChange={(e) => handleTextUpdate('content', e.target.value)}
          />
          <p className="text-xs text-gray-500">
            {properties.barcodeType === 'qrcode' 
              ? 'QR Codes can store URLs, text, or contact information' 
              : 'Enter numeric or alphanumeric data for the barcode'}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="x-pos">X Position</Label>
            <Input 
              id="x-pos" 
              value={position.x} 
              type="number"
              onChange={(e) => handlePositionSizeUpdate('x', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="y-pos">Y Position</Label>
            <Input 
              id="y-pos" 
              value={position.y} 
              type="number"
              onChange={(e) => handlePositionSizeUpdate('y', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="width">Width</Label>
            <Input 
              id="width" 
              value={size.width} 
              type="number"
              onChange={(e) => handlePositionSizeUpdate('width', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="height">Height</Label>
            <Input 
              id="height" 
              value={size.height} 
              type="number"
              onChange={(e) => handlePositionSizeUpdate('height', e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="show-text" 
            checked={properties.showText || false}
            onChange={(e) => handleTextUpdate('showText', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="show-text">Show text below barcode</Label>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => document.dispatchEvent(new CustomEvent('edit-barcode-element', { detail: { elementId: selectedElement } }))}
        >
          Edit Barcode Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 text-center text-gray-500">
      Select an element to edit its properties
    </div>
  );
};

export default ElementProperties;
