
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

const ElementProperties = () => {
  const queryClient = useQueryClient();
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('style');

  // Listen for element selection events
  useEffect(() => {
    const handleElementSelected = (event: Event) => {
      const customEvent = event as CustomEvent;
      const elementId = customEvent.detail?.elementId;
      setSelectedElementId(elementId);
    };

    const handleElementDeselected = () => {
      setSelectedElementId(null);
    };

    document.addEventListener('element-selected', handleElementSelected);
    document.addEventListener('element-deselected', handleElementDeselected);

    return () => {
      document.removeEventListener('element-selected', handleElementSelected);
      document.removeEventListener('element-deselected', handleElementDeselected);
    };
  }, []);

  // Fetch selected element details
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
          toast({
            title: 'Error loading element',
            description: error.message,
            variant: 'destructive'
          });
          throw error;
        }

        return data;
      } catch (error: any) {
        console.error('Error fetching element:', error);
        return null;
      }
    },
    enabled: !!selectedElementId
  });

  // Update element properties mutation
  const updateElementMutation = useMutation({
    mutationFn: async ({ 
      elementId, 
      updates 
    }: { 
      elementId: string; 
      updates: Partial<{
        properties: any;
        position: { x: number, y: number };
        size: { width: number, height: number };
        name: string;
      }>;
    }) => {
      const { data, error } = await supabase
        .from('template_elements')
        .update(updates)
        .eq('id', elementId)
        .select()
        .single();

      if (error) {
        toast({
          title: 'Failed to update element',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['element', selectedElementId] });
      queryClient.invalidateQueries({ queryKey: ['template-elements'] });
      toast({
        title: 'Element updated',
        description: 'Properties have been saved'
      });
    }
  });

  // Handle property changes
  const updateProperty = (propertyName: string, value: any) => {
    if (!selectedElementId || !elementData) return;
    
    const properties = typeof elementData.properties === 'string' 
      ? JSON.parse(elementData.properties) 
      : { ...elementData.properties };
    
    properties[propertyName] = value;
    
    updateElementMutation.mutate({
      elementId: selectedElementId,
      updates: { properties }
    });
  };

  const updatePosition = (axis: 'x' | 'y', value: number) => {
    if (!selectedElementId || !elementData) return;
    
    const position = typeof elementData.position === 'string' 
      ? JSON.parse(elementData.position) 
      : { ...elementData.position };
    
    position[axis] = value;
    
    updateElementMutation.mutate({
      elementId: selectedElementId,
      updates: { position }
    });
  };

  const updateSize = (dimension: 'width' | 'height', value: number) => {
    if (!selectedElementId || !elementData) return;
    
    const size = typeof elementData.size === 'string' 
      ? JSON.parse(elementData.size) 
      : { ...elementData.size };
    
    size[dimension] = value;
    
    updateElementMutation.mutate({
      elementId: selectedElementId,
      updates: { size }
    });
  };

  const updateName = (name: string) => {
    if (!selectedElementId) return;
    
    updateElementMutation.mutate({
      elementId: selectedElementId,
      updates: { name }
    });
  };

  // Parse element properties
  const elementProperties = elementData?.properties 
    ? (typeof elementData.properties === 'string' 
        ? JSON.parse(elementData.properties) 
        : elementData.properties)
    : {};
  
  const elementPosition = elementData?.position
    ? (typeof elementData.position === 'string'
        ? JSON.parse(elementData.position)
        : elementData.position)
    : { x: 0, y: 0 };
    
  const elementSize = elementData?.size
    ? (typeof elementData.size === 'string'
        ? JSON.parse(elementData.size)
        : elementData.size)
    : { width: 100, height: 100 };

  if (!selectedElementId) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-center text-gray-500">
          <p>Select an element to edit its properties</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!elementData) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 text-center text-gray-500">
          <p>Failed to load element properties</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['element', selectedElementId] })}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="py-3">
        <CardTitle className="text-lg flex justify-between items-center">
          <Input
            value={elementData.name}
            onChange={(e) => updateName(e.target.value)}
            className="h-7 text-base font-medium"
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="position">Position</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="space-y-4">
            {elementData.type === 'text' && (
              <>
                <div className="space-y-2">
                  <Label>Text Content</Label>
                  <Input
                    value={elementProperties.content || ''}
                    onChange={(e) => updateProperty('content', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select
                    value={elementProperties.fontFamily || 'Arial'}
                    onValueChange={(value) => updateProperty('fontFamily', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Verdana">Verdana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Font Size: {elementProperties.fontSize || 16}px</Label>
                  <Slider
                    value={[elementProperties.fontSize || 16]}
                    min={8}
                    max={72}
                    step={1}
                    onValueChange={(value) => updateProperty('fontSize', value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={elementProperties.color || '#000000'}
                      onChange={(e) => updateProperty('color', e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      type="text"
                      value={elementProperties.color || '#000000'}
                      onChange={(e) => updateProperty('color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Text Alignment</Label>
                    <Select
                      value={elementProperties.textAlign || 'left'}
                      onValueChange={(value) => updateProperty('textAlign', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Font Weight</Label>
                    <Select
                      value={elementProperties.fontWeight || 'normal'}
                      onValueChange={(value) => updateProperty('fontWeight', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {elementData.type === 'image' && (
              <>
                <div className="space-y-2">
                  <Label>Image Source</Label>
                  <Input
                    value={elementProperties.src || ''}
                    onChange={(e) => updateProperty('src', e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-gray-500">Double-click on the image to change it</p>
                </div>

                <div className="space-y-2">
                  <Label>Object Fit</Label>
                  <Select
                    value={elementProperties.objectFit || 'contain'}
                    onValueChange={(value) => updateProperty('objectFit', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contain">Contain</SelectItem>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="fill">Fill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {elementData.type === 'barcode' && (
              <>
                <div className="space-y-2">
                  <Label>Barcode Type</Label>
                  <Input
                    value={elementProperties.type || 'CODE128'}
                    disabled
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Barcode Value</Label>
                  <Input
                    value={elementProperties.value || ''}
                    onChange={(e) => updateProperty('value', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-text"
                    checked={elementProperties.displayValue || false}
                    onCheckedChange={(checked) => updateProperty('displayValue', checked)}
                  />
                  <Label htmlFor="show-text">Display Value</Label>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="position" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>X Position: {elementPosition.x}px</Label>
                <Input
                  type="number"
                  value={elementPosition.x}
                  onChange={(e) => updatePosition('x', Number(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Y Position: {elementPosition.y}px</Label>
                <Input
                  type="number"
                  value={elementPosition.y}
                  onChange={(e) => updatePosition('y', Number(e.target.value))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Width: {elementSize.width}px</Label>
                <Input
                  type="number"
                  value={elementSize.width}
                  onChange={(e) => updateSize('width', Number(e.target.value))}
                  min={10}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Height: {elementSize.height}px</Label>
                <Input
                  type="number"
                  value={elementSize.height}
                  onChange={(e) => updateSize('height', Number(e.target.value))}
                  min={10}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Rotation: {elementData.rotation || 0}°</Label>
              <Slider
                value={[elementData.rotation || 0]}
                min={0}
                max={360}
                step={1}
                onValueChange={(value) => {
                  updateElementMutation.mutate({
                    elementId: selectedElementId,
                    updates: { rotation: value[0] }
                  });
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Layer: {elementData.layer || 0}</Label>
              <Input
                type="number"
                value={elementData.layer || 0}
                onChange={(e) => {
                  updateElementMutation.mutate({
                    elementId: selectedElementId,
                    updates: { layer: Number(e.target.value) }
                  });
                }}
                min={0}
              />
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <div className="space-y-2">
              <Label>Dynamic Data Field</Label>
              <Select
                value={elementProperties.dataField || ''}
                onValueChange={(value) => updateProperty('dataField', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No data binding" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No data binding</SelectItem>
                  <SelectItem value="firstName">First Name</SelectItem>
                  <SelectItem value="lastName">Last Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="address">Address</SelectItem>
                  <SelectItem value="city">City</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="zipCode">Zip Code</SelectItem>
                  <SelectItem value="productId">Product ID</SelectItem>
                  <SelectItem value="sku">SKU</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Bind this element to a data field for batch printing
              </p>
            </div>
            
            {elementProperties.dataField && (
              <div className="space-y-2">
                <Label>Preview Value</Label>
                <Input
                  value={elementProperties.dataPreview || `{${elementProperties.dataField}}`}
                  onChange={(e) => updateProperty('dataPreview', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  This value is used for preview only
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 pb-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setSelectedElementId(null)}
        >
          Deselect
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => {
            if (selectedElementId) {
              const event = new CustomEvent('delete-element', {
                detail: { elementId: selectedElementId }
              });
              document.dispatchEvent(event);
              setSelectedElementId(null);
            }
          }}
        >
          Delete Element
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ElementProperties;
