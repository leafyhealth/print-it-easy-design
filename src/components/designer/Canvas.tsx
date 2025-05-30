import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Import our components
import CanvasToolbar from './CanvasToolbar';
import CanvasElement from './CanvasElement';
import CanvasGrid from './CanvasGrid';
import CanvasRulers from './CanvasRulers';
import TextEditor from './TextEditor';
import ImageUploader from './ImageUploader';
import BarcodeEditor from './editors/BarcodeEditor';
import { GridSettings } from '@/types/designer';

interface CanvasProps {
  width?: number;
  height?: number;
  showGrid?: boolean;
  templateId?: string;
  showMargins?: boolean;
  showRulers?: boolean;
  showSnaplines?: boolean;
  showLabelGrid?: boolean;
  gridSettings?: GridSettings | null;
}

const Canvas: React.FC<CanvasProps> = ({
  width = 600,
  height = 400,
  showGrid: initialShowGrid = true,
  templateId,
  showMargins: initialShowMargins = false,
  showRulers: initialShowRulers = true,
  showSnaplines: initialShowSnaplines = false,
  showLabelGrid = false,
  gridSettings = null,
}) => {
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // State management
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [showBarcodeEditor, setShowBarcodeEditor] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartData, setResizeStartData] = useState<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    direction: string;
  } | null>(null);
  
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showRulers, setShowRulers] = useState(initialShowRulers);
  const [showSnaplines, setShowSnaplines] = useState(initialShowSnaplines);
  const [showMargins, setShowMargins] = useState(initialShowMargins);
  const [showGridState, setShowGridState] = useState(initialShowGrid);
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPos, setPanStartPos] = useState({ x: 0, y: 0 });
  const [showLabelGridState, setShowLabelGridState] = useState(showLabelGrid);

  // Query template data
  const { data: template, isLoading: isTemplateLoading, error: templateError } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      
      try {
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .eq('id', templateId)
          .single();

        if (error) {
          throw error;
        }

        return data;
      } catch (error: any) {
        console.error('Error fetching template:', error);
        toast({
          title: 'Error loading template',
          description: error.message || 'Failed to load template details',
          variant: 'destructive'
        });
        return null;
      }
    },
    enabled: !!templateId,
    retry: 2
  });

  // Get grid settings from template
  const gridSettings: GridSettings = template?.grid_settings ? 
    (typeof template.grid_settings === 'string' 
      ? JSON.parse(template.grid_settings) 
      : template.grid_settings as unknown as GridSettings) 
    : { showGrid: true, gridSize: 10 };

  // Query template elements
  const { data: templateElements, isLoading: isElementsLoading, error: elementsError } = useQuery({
    queryKey: ['template-elements', templateId],
    queryFn: async () => {
      if (!templateId) return [];
      
      try {
        const { data, error } = await supabase
          .from('template_elements')
          .select('*')
          .eq('template_id', templateId);

        if (error) {
          throw error;
        }

        return data || [];
      } catch (error: any) {
        console.error('Error fetching template elements:', error);
        toast({
          title: 'Error loading elements',
          description: error.message || 'Failed to load template elements',
          variant: 'destructive'
        });
        return [];
      }
    },
    enabled: !!templateId,
    retry: 2
  });

  const isLoading = isTemplateLoading || isElementsLoading;
  const hasError = templateError || elementsError;

  // Selected element data
  const selectedElementData = templateElements?.find(
    (element) => element.id === selectedElement
  );

  // Mutations
  const addElementMutation = useMutation({
    mutationFn: async (newElement: {
      type: string;
      name: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      rotation: number;
      layer: number;
      properties: any;
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

  const updateElementMutation = useMutation({
    mutationFn: async ({ 
      id, 
      updates
    }: { 
      id: string, 
      updates: Partial<{
        position: { x: number, y: number };
        size: { width: number, height: number };
        properties: any;
        name: string;
      }> 
    }) => {
      const { data, error } = await supabase
        .from('template_elements')
        .update(updates)
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

  // Element handlers - defined before they're used in the useEffect or rendering
  const handleAddTextElement = () => {
    if (!templateId) {
      toast({
        title: 'No template selected',
        description: 'Please select or create a template first.',
        variant: 'destructive'
      });
      return;
    }
    
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

  const handleAddImageElement = () => {
    if (!templateId) {
      toast({
        title: 'No template selected',
        description: 'Please select or create a template first.',
        variant: 'destructive'
      });
      return;
    }
    
    setShowImageUploader(true);
  };

  const handleImageSelect = (imageUrl: string) => {
    const newImageElement = {
      type: 'image',
      name: 'New Image',
      position: { x: 100, y: 100 },
      size: { width: 150, height: 150 },
      rotation: 0,
      layer: 0,
      properties: {
        src: imageUrl,
        objectFit: 'contain'
      }
    };

    addElementMutation.mutate(newImageElement);
  };

  const handleAddBarcodeElement = () => {
    if (!templateId) {
      toast({
        title: 'No template selected',
        description: 'Please select or create a template first.',
        variant: 'destructive'
      });
      return;
    }
    
    setShowBarcodeEditor(true);
  };

  const handleBarcodeConfigured = (barcodeProps: any) => {
    const newBarcodeElement = {
      type: 'barcode',
      name: 'New Barcode',
      position: { x: 100, y: 150 },
      size: { width: barcodeProps.width, height: barcodeProps.height },
      rotation: 0,
      layer: 0,
      properties: {
        ...barcodeProps
      }
    };

    addElementMutation.mutate(newBarcodeElement);
  };

  const handleDeleteElement = () => {
    if (selectedElement) {
      deleteElementMutation.mutate(selectedElement);
    } else {
      toast({
        title: 'No element selected',
        description: 'Please select an element to delete',
        variant: 'destructive'
      });
    }
  };

  const handleElementDoubleClick = (elementId: string, elementType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    
    switch (elementType) {
      case 'text':
        setShowTextEditor(true);
        break;
      case 'image':
        setShowImageUploader(true);
        break;
      case 'barcode':
        setShowBarcodeEditor(true);
        break;
      default:
        break;
    }
  };

  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    
    const event = new CustomEvent('element-selected', { 
      detail: { elementId } 
    });
    document.dispatchEvent(event);
  };

  const handleDragStart = (e: React.MouseEvent, elementId: string) => {
    if (!selectedElement || selectedElement !== elementId) {
      setSelectedElement(elementId);
      
      const event = new CustomEvent('element-selected', { 
        detail: { elementId } 
      });
      document.dispatchEvent(event);
    }
    
    setIsDragging(true);
    setDragStartPos({ 
      x: e.clientX, 
      y: e.clientY 
    });
    
    e.preventDefault();
  };

  const handleDrag = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedElement || !templateElements) return;
    
    const element = templateElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    const deltaX = (e.clientX - dragStartPos.x) / (zoomLevel / 100);
    const deltaY = (e.clientY - dragStartPos.y) / (zoomLevel / 100);
    
    const newPosition = {
      x: (element.position as any).x + deltaX,
      y: (element.position as any).y + deltaY
    };
    
    const updatedElements = templateElements.map(el => {
      if (el.id === selectedElement) {
        return {
          ...el,
          position: newPosition
        };
      }
      return el;
    });
    
    setDragStartPos({ x: e.clientX, y: e.clientY });
    
    queryClient.setQueryData(['template-elements', templateId], updatedElements);
  }, [isDragging, selectedElement, dragStartPos, templateElements, queryClient, templateId, zoomLevel]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging || !selectedElement || !templateElements) return;
    
    const element = templateElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    updateElementMutation.mutate({ 
      id: element.id, 
      updates: { position: element.position as any } 
    });
    
    setIsDragging(false);
  }, [isDragging, selectedElement, templateElements, updateElementMutation]);

  const handleResizeStart = (e: React.MouseEvent, elementId: string, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!templateElements) return;
    const element = templateElements.find(el => el.id === elementId);
    if (!element) return;
    
    setSelectedElement(elementId);
    setIsResizing(true);
    setResizeStartData({
      startX: e.clientX,
      startY: e.clientY,
      startWidth: (element.size as any).width,
      startHeight: (element.size as any).height,
      direction
    });
  };

  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing || !selectedElement || !templateElements || !resizeStartData) return;
    
    const element = templateElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    let newWidth = resizeStartData.startWidth;
    let newHeight = resizeStartData.startHeight;
    
    const deltaX = (e.clientX - resizeStartData.startX) / (zoomLevel / 100);
    const deltaY = (e.clientY - resizeStartData.startY) / (zoomLevel / 100);
    
    if (resizeStartData.direction.includes('e')) {
      newWidth = Math.max(20, resizeStartData.startWidth + deltaX);
    }
    if (resizeStartData.direction.includes('w')) {
      newWidth = Math.max(20, resizeStartData.startWidth - deltaX);
    }
    if (resizeStartData.direction.includes('s')) {
      newHeight = Math.max(20, resizeStartData.startHeight + deltaY);
    }
    if (resizeStartData.direction.includes('n')) {
      newHeight = Math.max(20, resizeStartData.startHeight - deltaY);
    }
    
    const updatedElements = templateElements.map(el => {
      if (el.id === selectedElement) {
        const newElement = { ...el };
        newElement.size = { width: newWidth, height: newHeight };
        
        if (resizeStartData.direction.includes('w')) {
          const deltaPos = resizeStartData.startWidth - newWidth;
          newElement.position = { 
            x: (element.position as any).x + deltaPos, 
            y: (element.position as any).y 
          };
        }
        if (resizeStartData.direction.includes('n')) {
          const deltaPos = resizeStartData.startHeight - newHeight;
          newElement.position = { 
            x: (element.position as any).x, 
            y: (element.position as any).y + deltaPos 
          };
        }
        
        return newElement;
      }
      return el;
    });
    
    queryClient.setQueryData(['template-elements', templateId], updatedElements);
  }, [isResizing, selectedElement, resizeStartData, templateElements, queryClient, templateId, zoomLevel]);

  const handleResizeEnd = useCallback(() => {
    if (!isResizing || !selectedElement || !templateElements) return;
    
    const element = templateElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    updateElementMutation.mutate({ 
      id: element.id, 
      updates: { 
        size: element.size as any,
        position: element.position as any
      } 
    });
    
    setIsResizing(false);
    setResizeStartData(null);
  }, [isResizing, selectedElement, templateElements, updateElementMutation]);

  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStartPos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };

  const handlePan = useCallback((e: MouseEvent) => {
    if (!isPanning) return;
    
    const deltaX = e.clientX - panStartPos.x;
    const deltaY = e.clientY - panStartPos.y;
    
    setCanvasPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setPanStartPos({ x: e.clientX, y: e.clientY });
  }, [isPanning, panStartPos]);

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 10 : -10;
      const newZoom = Math.max(25, Math.min(500, zoomLevel + delta));
      setZoomLevel(newZoom);
    }
  };

  const handleZoomFit = () => {
    if (!canvasRef.current) return;
    
    const canvasEl = canvasRef.current;
    const canvasWidth = canvasEl.clientWidth;
    const canvasHeight = canvasEl.clientHeight;
    
    const scaleX = (canvasWidth - 40) / width;
    const scaleY = (canvasHeight - 40) / height;
    const scale = Math.min(scaleX, scaleY) * 100;
    
    setZoomLevel(scale);
    setCanvasPan({ x: 0, y: 0 });
  };

  const handleZoomObjects = () => {
    if (!templateElements || templateElements.length === 0) {
      handleZoomFit();
      return;
    }
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    templateElements.forEach(element => {
      const position = element.position as any;
      const size = element.size as any;
      
      minX = Math.min(minX, position.x);
      minY = Math.min(minY, position.y);
      maxX = Math.max(maxX, position.x + size.width);
      maxY = Math.max(maxY, position.y + size.height);
    });
    
    minX -= 20;
    minY -= 20;
    maxX += 20;
    maxY += 20;
    
    const objectsWidth = maxX - minX;
    const objectsHeight = maxY - minY;
    
    if (!canvasRef.current) return;
    
    const canvasEl = canvasRef.current;
    const canvasWidth = canvasEl.clientWidth;
    const canvasHeight = canvasEl.clientHeight;
    
    const scaleX = canvasWidth / objectsWidth;
    const scaleY = canvasHeight / objectsHeight;
    const scale = Math.min(scaleX, scaleY) * 100;
    
    setZoomLevel(Math.min(100, scale));
    
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    setCanvasPan({
      x: (canvasWidth / 2) - (centerX * (scale / 100)),
      y: (canvasHeight / 2) - (centerY * (scale / 100))
    });
  };

  const handleCanvasClick = () => {
    setSelectedElement(null);
    
    const event = new CustomEvent('element-deselected');
    document.dispatchEvent(event);
  };

  const handleSaveTextChanges = (textProperties: any) => {
    if (selectedElement) {
      updateElementMutation.mutate({
        id: selectedElement,
        updates: {
          properties: textProperties
        }
      });
    }
  };

  // Effect for drag and resize events
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    }
    
    if (isResizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
    }
    
    if (isPanning) {
      window.addEventListener('mousemove', handlePan);
      window.addEventListener('mouseup', handlePanEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('mousemove', handleResize);
      window.removeEventListener('mouseup', handleResizeEnd);
      window.removeEventListener('mousemove', handlePan);
      window.removeEventListener('mouseup', handlePanEnd);
    };
  }, [isDragging, isResizing, isPanning, handleDrag, handleDragEnd, handleResize, handleResizeEnd, handlePan, handlePanEnd]);

  // Effect for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'z' && e.ctrlKey) {
        e.preventDefault();
      }
      
      if ((e.key === 'y' && e.ctrlKey) || (e.key === 'z' && e.ctrlKey && e.shiftKey)) {
        e.preventDefault();
      }
      
      if (selectedElement && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        
        const element = templateElements?.find(el => el.id === selectedElement);
        if (!element) return;
        
        const step = e.shiftKey ? 10 : 1;
        let newX = (element.position as any).x;
        let newY = (element.position as any).y;
        
        switch (e.key) {
          case 'ArrowUp': newY -= step; break;
          case 'ArrowDown': newY += step; break;
          case 'ArrowLeft': newX -= step; break;
          case 'ArrowRight': newX += step; break;
        }
        
        updateElementMutation.mutate({
          id: element.id,
          updates: {
            position: { x: newX, y: newY }
          }
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElement, templateElements, updateElementMutation]);

  // Effect for window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && templateId) {
        handleZoomFit();
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [templateId]);

  // Effect for element event listeners
  useEffect(() => {
    const handleAddElement = (event: Event) => {
      const customEvent = event as CustomEvent;
      const elementType = customEvent.detail.type;
      
      switch (elementType) {
        case 'text':
          handleAddTextElement();
          break;
        case 'image':
          handleAddImageElement();
          break;
        case 'barcode':
          handleAddBarcodeElement();
          break;
        case 'shape':
          // handle shape element
          break;
      }
    };

    document.addEventListener('add-element', handleAddElement);
    document.addEventListener('add-text-element', handleAddTextElement);
    document.addEventListener('add-image-element', handleAddImageElement);
    document.addEventListener('add-barcode-element', handleAddBarcodeElement);
    
    return () => {
      document.removeEventListener('add-element', handleAddElement);
      document.removeEventListener('add-text-element', handleAddTextElement);
      document.removeEventListener('add-image-element', handleAddImageElement);
      document.removeEventListener('add-barcode-element', handleAddBarcodeElement);
    };
  }, [templateId]); // Only depend on templateId since our handler functions are stable now

  // Listen for label grid toggle events
  useEffect(() => {
    const handleToggleLabelGrid = (event: Event) => {
      const customEvent = event as CustomEvent;
      setShowLabelGridState(customEvent.detail.showGrid);
    };

    document.addEventListener('toggle-label-grid', handleToggleLabelGrid);
    
    return () => {
      document.removeEventListener('toggle-label-grid', handleToggleLabelGrid);
    };
  }, []);

  // Update label grid state when prop changes
  useEffect(() => {
    setShowLabelGridState(showLabelGrid);
  }, [showLabelGrid]);

  // Show appropriate dimensions based on the label settings
  const getLabelDimensions = () => {
    if (!gridSettings || gridSettings.labelLayout !== 'grid') {
      return { width: width, height: height };
    }

    return {
      width: gridSettings.labelWidth || width,
      height: gridSettings.labelHeight || height
    };
  };

  const labelDimensions = getLabelDimensions();

  // Auto-fit and center the canvas when template changes
  useEffect(() => {
    if (templateId && !isLoading && !hasError) {
      // Delay the zoom fit slightly to ensure dimensions are ready
      setTimeout(() => {
        handleZoomFit();
      }, 300);
    }
  }, [templateId, isLoading, hasError]);

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <CanvasToolbar
          onAddText={handleAddTextElement}
          onAddImage={handleAddImageElement}
          onAddBarcode={handleAddBarcodeElement}
          onDeleteElement={handleDeleteElement}
          hasSelectedElement={!!selectedElement}
          showRulers={showRulers}
          onToggleRulers={() => setShowRulers(!showRulers)}
          showGrid={showGridState}
          onToggleGrid={() => setShowGridState(!showGridState)}
          zoomLevel={zoomLevel}
          onZoomIn={() => setZoomLevel(Math.min(500, zoomLevel + 10))}
          onZoomOut={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
          onZoomFit={handleZoomFit}
          onZoomObjects={handleZoomObjects}
        />
        <div className="relative flex-1 overflow-auto bg-gray-300 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center bg-white p-8 rounded-lg shadow-lg">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Loading template...</p>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (hasError) {
    return (
      <div className="flex flex-col h-full">
        <CanvasToolbar
          onAddText={handleAddTextElement}
          onAddImage={handleAddImageElement}
          onAddBarcode={handleAddBarcodeElement}
          onDeleteElement={handleDeleteElement}
          hasSelectedElement={!!selectedElement}
          showRulers={showRulers}
          onToggleRulers={() => setShowRulers(!showRulers)}
          showGrid={showGridState}
          onToggleGrid={() => setShowGridState(!showGridState)}
          zoomLevel={zoomLevel}
          onZoomIn={() => setZoomLevel(Math.min(500, zoomLevel + 10))}
          onZoomOut={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
          onZoomFit={handleZoomFit}
          onZoomObjects={handleZoomObjects}
        />
        <div className="relative flex-1 overflow-auto bg-gray-300 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h3 className="text-xl font-bold mb-2 text-red-600">Error Loading Template</h3>
            <p className="mb-4">There was a problem loading the template or its elements.</p>
            <Button onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['template', templateId] });
              queryClient.invalidateQueries({ queryKey: ['template-elements', templateId] });
            }}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <CanvasToolbar
        onAddText={handleAddTextElement}
        onAddImage={handleAddImageElement}
        onAddBarcode={handleAddBarcodeElement}
        onDeleteElement={handleDeleteElement}
        hasSelectedElement={!!selectedElement}
        showRulers={showRulers}
        onToggleRulers={() => setShowRulers(!showRulers)}
        showGrid={showGridState}
        onToggleGrid={() => setShowGridState(!showGridState)}
        zoomLevel={zoomLevel}
        onZoomIn={() => setZoomLevel(Math.min(500, zoomLevel + 10))}
        onZoomOut={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
        onZoomFit={handleZoomFit}
        onZoomObjects={handleZoomObjects}
      />
      
      <div 
        className="relative flex-1 overflow-auto bg-gray-300"
        onWheel={handleWheel}
        onMouseDown={handlePanStart}
        ref={canvasRef}
        onClick={handleCanvasClick}
      >
        {/* Label dimensions indicator */}
        <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-mono text-gray-700 shadow z-10">
          {gridSettings?.labelLayout === 'grid' ? 
            `Label: ${Math.round(labelDimensions.width)}px × ${Math.round(labelDimensions.height)}px` : 
            `Canvas: ${width}px × ${height}px`}
        </div>
        
        <div
          className="absolute bg-white shadow-lg"
          style={{
            width: `${width * (zoomLevel / 100)}px`,
            height: `${height * (zoomLevel / 100)}px`,
            transform: `translate(${canvasPan.x}px, ${canvasPan.y}px)`,
            overflow: 'hidden'
          }}
        >
          <CanvasGrid
            showGrid={showGridState}
            width={width}
            height={height}
            zoomLevel={zoomLevel}
            gridSize={gridSettings?.gridSize || 10}
            showMargins={showMargins}
            marginSize={15}
            showLabelGrid={showLabelGridState}
            gridSettings={gridSettings}
          />
          
          <CanvasRulers
            showRulers={showRulers}
            width={width}
            height={height}
            zoomLevel={zoomLevel}
          />
          
          {!isLoading && templateElements && templateElements.map(element => (
            <CanvasElement
              key={element.id}
              element={element}
              zoomLevel={zoomLevel}
              isSelected={selectedElement === element.id}
              onElementClick={handleElementClick}
              onElementDoubleClick={handleElementDoubleClick}
              onDragStart={handleDragStart}
              onResizeStart={handleResizeStart}
            />
          ))}
        </div>
      </div>
      
      {showTextEditor && selectedElementData && selectedElementData.type === 'text' && (
        <TextEditor
          open={showTextEditor}
          onOpenChange={setShowTextEditor}
          textProperties={(selectedElementData.properties as any) || {}}
          onSave={handleSaveTextChanges}
        />
      )}
      
      {showImageUploader && (
        <ImageUploader 
          open={showImageUploader}
          onOpenChange={setShowImageUploader}
          onImageSelect={handleImageSelect}
          templateId={templateId}
        />
      )}
      
      {showBarcodeEditor && (
        <BarcodeEditor
          open={showBarcodeEditor}
          onOpenChange={setShowBarcodeEditor}
          onSave={handleBarcodeConfigured}
          initialProperties={{}}
        />
      )}
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <p className="text-lg font-medium">Loading elements...</p>
        </div>
      )}
    </div>
  );
};

export default Canvas;
