
import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LabelTemplate, DesignElement, TextElement } from '@/types/designer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

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
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  // Fetch template elements
  const { data: templateData, isLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      
      const { data: elementsData, error } = await supabase
        .from('template_elements')
        .select('*')
        .eq('template_id', templateId);

      if (error) {
        toast({
          title: 'Error fetching template elements',
          description: error.message,
          variant: 'destructive'
        });
        return null;
      }

      return elementsData;
    },
    enabled: !!templateId
  });

  // Mutation to add a new text element
  const addElementMutation = useMutation({
    mutationFn: async (newElement: {
      type: string;
      name: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      rotation: number;
      layer: number;
      properties: Record<string, any>;
      content?: string;
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
      queryClient.invalidateQueries({ queryKey: ['template', templateId] });
      setSelectedElement(newElement.id);
      toast({
        title: 'Element Added',
        description: `${newElement.name} added to template`
      });
    }
  });

  // Add a default text element
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

  // Render elements
  const renderElements = () => {
    if (!templateData) return null;

    return templateData.map((element) => (
      <div
        key={element.id}
        className={cn(
          "absolute border-2",
          selectedElement === element.id 
            ? "border-designer-primary" 
            : "border-transparent hover:border-designer-primary/50"
        )}
        style={{
          left: `${(element.position as any).x}px`,
          top: `${(element.position as any).y}px`,
          width: `${(element.size as any).width}px`,
          height: `${(element.size as any).height}px`,
          transform: `rotate(${element.rotation}deg)`
        }}
        onClick={() => setSelectedElement(element.id)}
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
      </div>
    ));
  };

  return (
    <div className="relative overflow-auto h-full flex items-center justify-center bg-designer-canvas p-8">
      <div className="flex flex-col">
        <div className="mb-4">
          <Button onClick={handleAddTextElement} variant="outline">
            Add Text Element
          </Button>
        </div>
        <div
          className={cn(
            "designer-canvas relative border border-gray-300",
            { "canvas-grid": showGrid }
          )}
          style={{
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          {renderElements()}
          
          {(!templateData || templateData.length === 0) && (
            <div className="absolute inset-0 p-4 text-center flex items-center justify-center text-gray-400">
              <p>Drag elements from the sidebar or click "Add Text Element" to start designing your label</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
