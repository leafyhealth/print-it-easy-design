
import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LabelTemplate, DesignElement } from '@/types/designer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Trash, Save, Image, Text, SquarePlus } from 'lucide-react';

interface CanvasProps {
  width?: number;
  height?: number;
  showGrid?: boolean;
  templateId?: string; // Optional template ID
}

const Canvas: React.FC<CanvasProps> = ({
  width = 600,
  height = 400,
  showGrid = true,
  templateId,
}) => {
  const queryClient = useQueryClient();
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  
  // Fetch template elements
  const { data: templateElements, isLoading } = useQuery({
    queryKey: ['template-elements', templateId],
    queryFn: async () => {
      if (!templateId) return [];
      
      const { data, error } = await supabase
        .from('template_elements')
        .select('*')
        .eq('template_id', templateId);

      if (error) {
        toast({
          title: 'Error fetching template elements',
          description: error.message,
          variant: 'destructive'
        });
        return [];
      }

      return data || [];
    },
    enabled: !!templateId
  });

  // Mutation to add a new element
  const addElementMutation = useMutation({
    mutationFn: async (newElement: {
      type: string;
      name: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      rotation: number;
      layer: number;
      properties: Record<string, any>;
    }) => {
      if (!templateId) {
        throw new Error('No template selected');
      }

      const { data, error } = await supabase
        .from('template_elements')
        .insert({
          template_id: templateId,
          type: newElement.type,
          name: newElement.name,
          position: newElement.position,
          size: newElement.size,
          rotation: newElement.rotation,
          layer: newElement.layer,
          properties: newElement.properties
        })
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error adding element',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }

      return data;
    },
    onSuccess: (newElement) => {
      queryClient.invalidateQueries({ queryKey: ['template-elements', templateId] });
      setSelectedElement(newElement.id);
      toast({
        title: 'Element Added',
        description: `${newElement.name} added to template`
      });
    }
  });

  // Mutation to update an element
  const updateElementMutation = useMutation({
    mutationFn: async ({ id, position }: { id: string, position: { x: number, y: number } }) => {
      const { data, error } = await supabase
        .from('template_elements')
        .update({ position })
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        toast({
          title: 'Error updating element',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-elements', templateId] });
    }
  });
  
  // Mutation to delete an element
  const deleteElementMutation = useMutation({
    mutationFn: async (elementId: string) => {
      const { error } = await supabase
        .from('template_elements')
        .delete()
        .eq('id', elementId);
        
      if (error) {
        toast({
          title: 'Error deleting element',
          description: error.message,
          variant: 'destructive'
        });
        throw error;
      }
      
      return elementId;
    },
    onSuccess: (deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['template-elements', templateId] });
      if (selectedElement === deletedId) {
        setSelectedElement(null);
      }
      toast({
        title: 'Element Deleted',
        description: 'Element has been removed from template'
      });
    }
  });

  // Add a text element
  const handleAddTextElement = () => {
    const newTextElement = {
      type: 'text',
      name: 'New Text',
      position: { x: 50, y: 50 },
      size: { width: 150, height: 50 },
      rotation: 0,
      layer: 0,
      properties: {
        content: 'Sample Text',
        fontFamily: 'Arial',
        fontSize: 16,
        fontWeight: 'normal',
        fontStyle: 'normal',
        textAlign: 'left',
        textDecoration: 'none',
        color: '#000000'
      }
    };

    addElementMutation.mutate(newTextElement);
  };
  
  // Add an image element
  const handleAddImageElement = () => {
    const newImageElement = {
      type: 'image',
      name: 'New Image',
      position: { x: 200, y: 50 },
      size: { width: 120, height: 120 },
      rotation: 0,
      layer: 0,
      properties: {
        src: 'https://via.placeholder.com/120',
        objectFit: 'contain'
      }
    };

    addElementMutation.mutate(newImageElement);
  };
  
  // Add a barcode element
  const handleAddBarcodeElement = () => {
    const newBarcodeElement = {
      type: 'barcode',
      name: 'New Barcode',
      position: { x: 350, y: 50 },
      size: { width: 150, height: 80 },
      rotation: 0,
      layer: 0,
      properties: {
        content: '123456789',
        barcodeType: 'code128',
        showText: true
      }
    };

    addElementMutation.mutate(newBarcodeElement);
  };
  
  // Delete selected element
  const handleDeleteElement = () => {
    if (selectedElement) {
      deleteElementMutation.mutate(selectedElement);
    } else {
      toast({
        title: 'No element selected',
        description: 'Please select an element to delete'
      });
    }
  };
  
  // Handle element selection
  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(elementId);
  };
  
  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, elementId: string) => {
    if (!selectedElement || selectedElement !== elementId) return;
    
    setIsDragging(true);
    setDragStartPos({ 
      x: e.clientX, 
      y: e.clientY 
    });
    
    // Prevent default to disable browser's drag behavior
    e.preventDefault();
  };
  
  // Handle drag
  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedElement || !templateElements) return;
    
    const element = templateElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    const deltaX = e.clientX - dragStartPos.x;
    const deltaY = e.clientY - dragStartPos.y;
    
    const newPosition = {
      x: (element.position as any).x + deltaX,
      y: (element.position as any).y + deltaY
    };
    
    // Update element position visually (optimistic update)
    const updatedElements = templateElements.map(el => {
      if (el.id === selectedElement) {
        return {
          ...el,
          position: newPosition
        };
      }
      return el;
    });
    
    // Update drag start position
    setDragStartPos({ x: e.clientX, y: e.clientY });
    
    // Update queryClient cache for immediate visual feedback
    queryClient.setQueryData(['template-elements', templateId], updatedElements);
  }, [isDragging, selectedElement, dragStartPos, templateElements, queryClient, templateId]);
  
  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDragging || !selectedElement || !templateElements) return;
    
    const element = templateElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    // Save final position to database
    updateElementMutation.mutate({ 
      id: element.id, 
      position: element.position as any 
    });
    
    setIsDragging(false);
  }, [isDragging, selectedElement, templateElements, updateElementMutation]);
  
  // Set up mouse move and mouse up event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, handleDrag, handleDragEnd]);

  // Handle canvas click (deselect)
  const handleCanvasClick = () => {
    setSelectedElement(null);
  };

  // Render elements
  const renderElements = () => {
    if (!templateElements || templateElements.length === 0) return null;

    return templateElements.map((element) => (
      <div
        key={element.id}
        className={cn(
          "absolute border-2 cursor-move",
          selectedElement === element.id 
            ? "border-designer-primary z-10" 
            : "border-transparent hover:border-designer-primary/50"
        )}
        style={{
          left: `${(element.position as any).x}px`,
          top: `${(element.position as any).y}px`,
          width: `${(element.size as any).width}px`,
          height: `${(element.size as any).height}px`,
          transform: `rotate(${element.rotation}deg)`
        }}
        onClick={(e) => handleElementClick(element.id, e)}
        onMouseDown={(e) => handleDragStart(e, element.id)}
      >
        {element.type === 'text' && (
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{
              fontFamily: (element.properties as any).fontFamily,
              fontSize: `${(element.properties as any).fontSize}px`,
              color: (element.properties as any).color
            }}
          >
            {(element.properties as any).content || 'Sample Text'}
          </div>
        )}
        
        {element.type === 'image' && (
          <img 
            src={(element.properties as any).src} 
            alt={element.name}
            className="w-full h-full object-contain"
          />
        )}
        
        {element.type === 'barcode' && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="text-xs">{element.name}: {(element.properties as any).content}</div>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="relative overflow-auto h-full flex flex-col items-center justify-center bg-designer-canvas p-8">
      <div className="flex flex-col">
        <div className="mb-4 flex space-x-2">
          <Button onClick={handleAddTextElement} variant="outline" className="flex items-center gap-1">
            <Text className="h-4 w-4" />
            Add Text
          </Button>
          <Button onClick={handleAddImageElement} variant="outline" className="flex items-center gap-1">
            <Image className="h-4 w-4" />
            Add Image
          </Button>
          <Button onClick={handleAddBarcodeElement} variant="outline" className="flex items-center gap-1">
            <SquarePlus className="h-4 w-4" />
            Add Barcode
          </Button>
          <Button onClick={handleDeleteElement} variant="outline" disabled={!selectedElement} className="flex items-center gap-1 text-red-500">
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
        <div
          className={cn(
            "designer-canvas relative border border-gray-300 bg-white",
            { "canvas-grid": showGrid }
          )}
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
          onClick={handleCanvasClick}
        >
          {renderElements()}
          
          {(!templateElements || templateElements.length === 0) && (
            <div className="absolute inset-0 p-4 text-center flex items-center justify-center text-gray-400">
              <p>Drag elements from the sidebar or click the buttons above to start designing your label</p>
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50">
              <p>Loading elements...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
