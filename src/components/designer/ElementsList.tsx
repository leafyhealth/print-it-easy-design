
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Trash,
  ArrowUp,
  ArrowDown,
  Copy
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Position } from '@/types/designer';

interface ElementsListProps {
  templateId?: string;
}

const ElementsList: React.FC<ElementsListProps> = ({ templateId }) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch template elements
  const { data: elements = [] } = useQuery({
    queryKey: ['template-elements', templateId],
    queryFn: async () => {
      if (!templateId) return [];
      
      const { data, error } = await supabase
        .from('template_elements')
        .select('*')
        .eq('template_id', templateId)
        .order('layer', { ascending: true });

      if (error) {
        toast({
          title: 'Error fetching elements',
          description: error.message,
          variant: 'destructive'
        });
        return [];
      }

      return data || [];
    },
    enabled: !!templateId
  });

  // Listen for element selection events from Canvas
  useEffect(() => {
    const handleElementSelected = (event: Event) => {
      const customEvent = event as CustomEvent;
      setSelectedElementId(customEvent.detail.elementId);
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

  // Mutation for deleting elements
  const deleteMutation = useMutation({
    mutationFn: async (elementId: string) => {
      const { error } = await supabase
        .from('template_elements')
        .delete()
        .eq('id', elementId);
        
      if (error) throw error;
      return elementId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-elements', templateId] });
      setSelectedElementId(null);
      toast({ title: 'Element deleted successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to delete element', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation for duplicating elements
  const duplicateMutation = useMutation({
    mutationFn: async (elementId: string) => {
      // Get the element to duplicate
      const { data: elementToDuplicate, error: fetchError } = await supabase
        .from('template_elements')
        .select('*')
        .eq('id', elementId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Create a new element with slightly offset position
      const position = elementToDuplicate.position as unknown as Position;
      const newElement = {
        ...elementToDuplicate,
        id: undefined, // Let the database generate a new ID
        position: {
          x: position.x + 20,
          y: position.y + 20
        },
        name: `${elementToDuplicate.name} (Copy)`
      };
      
      const { data: newElementData, error: insertError } = await supabase
        .from('template_elements')
        .insert(newElement)
        .select()
        .single();
        
      if (insertError) throw insertError;
      return newElementData;
    },
    onSuccess: (newElement) => {
      queryClient.invalidateQueries({ queryKey: ['template-elements', templateId] });
      toast({ title: 'Element duplicated successfully' });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to duplicate element', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Mutation for changing element layer
  const updateLayerMutation = useMutation({
    mutationFn: async ({ elementId, direction }: { elementId: string; direction: 'up' | 'down' }) => {
      // Get current layer value
      const { data: currentElement, error: fetchError } = await supabase
        .from('template_elements')
        .select('layer')
        .eq('id', elementId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const newLayer = direction === 'up' 
        ? (currentElement.layer || 0) + 1 
        : Math.max((currentElement.layer || 0) - 1, 0);
      
      const { data, error } = await supabase
        .from('template_elements')
        .update({ layer: newLayer })
        .eq('id', elementId)
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-elements', templateId] });
    },
    onError: (error) => {
      toast({ 
        title: 'Failed to update element layer', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleElementSelect = (elementId: string) => {
    setSelectedElementId(elementId);
    
    // Dispatch event for canvas to listen to
    const event = new CustomEvent('element-selected', { 
      detail: { elementId } 
    });
    document.dispatchEvent(event);
  };

  const handleDelete = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteMutation.mutate(elementId);
  };

  const handleDuplicate = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateMutation.mutate(elementId);
  };

  const handleMoveLayer = (elementId: string, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    updateLayerMutation.mutate({ elementId, direction });
  };

  return (
    <div className="space-y-2">
      {elements.map((element) => (
        <div 
          key={element.id}
          className={`p-2 border rounded-md ${selectedElementId === element.id ? 'bg-gray-100 border-primary' : 'bg-white hover:bg-gray-50'} flex items-center justify-between cursor-pointer`}
          onClick={() => handleElementSelect(element.id)}
        >
          <div className="flex items-center">
            <div className="mr-2 w-5 h-5 flex items-center justify-center">
              {element.type === 'text' && (
                <span className="text-xs font-bold">T</span>
              )}
              {element.type === 'barcode' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              )}
              {element.type === 'image' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div>
              <div className="text-sm font-medium">{element.name}</div>
              <div className="text-xs text-gray-500 truncate w-36">
                {element.type === 'text' && (element.properties as any)?.content}
                {element.type === 'barcode' && (element.properties as any)?.content}
                {element.type === 'image' && 'Image'}
              </div>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={(e) => handleDuplicate(element.id, e)}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={(e) => handleMoveLayer(element.id, 'up', e)}
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={(e) => handleMoveLayer(element.id, 'down', e)}
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-red-600"
              onClick={(e) => handleDelete(element.id, e)}
            >
              <Trash className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
      {(!elements || elements.length === 0) && (
        <div className="text-center py-4 text-gray-500 text-sm">
          {templateId ? 'No elements added yet' : 'Select a template first'}
        </div>
      )}
    </div>
  );
};

export default ElementsList;
