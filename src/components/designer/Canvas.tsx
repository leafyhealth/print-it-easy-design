import React, { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DesignElement, GridSettings } from '@/types/designer';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Trash, Save, Image, Text, SquarePlus, Printer, ZoomIn, ZoomOut, Ruler, Grid3x3 } from 'lucide-react';
import TextEditor from './TextEditor';
import ImageUploader from './ImageUploader';
import BarcodeEditor from './BarcodeEditor';
import ZoomControls from './ZoomControls';
import VisualAidTools from './VisualAidTools';

interface CanvasProps {
  width?: number;
  height?: number;
  showGrid?: boolean;
  templateId?: string; // Optional template ID
}

const Canvas: React.FC<CanvasProps> = ({
  width = 600,
  height = 400,
  showGrid: initialShowGrid = true,
  templateId,
}) => {
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLDivElement>(null);
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
  const [showRulers, setShowRulers] = useState(true);
  const [showSnaplines, setShowSnaplines] = useState(true);
  const [showMargins, setShowMargins] = useState(true);
  const [showGridState, setShowGridState] = useState(initialShowGrid);
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPos, setPanStartPos] = useState({ x: 0, y: 0 });

  const { data: template, isLoading: isTemplateLoading } = useQuery({
    queryKey: ['template', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        toast({
          title: 'Error fetching template',
          description: error.message,
          variant: 'destructive'
        });
        return null;
      }

      return data;
    },
    enabled: !!templateId
  });

  const gridSettings: GridSettings = template?.grid_settings ? 
    (typeof template.grid_settings === 'string' 
      ? JSON.parse(template.grid_settings) 
      : template.grid_settings as unknown as GridSettings) 
    : { showGrid: true, gridSize: 10 };

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

  const selectedElementData = templateElements?.find(
    (element) => element.id === selectedElement
  );

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

  const handleEditText = () => {
    if (selectedElement && selectedElementData?.type === 'text') {
      setShowTextEditor(true);
    } else {
      toast({
        title: 'No text element selected',
        description: 'Please select a text element to edit',
        variant: 'destructive'
      });
    }
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

  const handleAlignHorizontal = (position: 'start' | 'center' | 'end') => {
    if (!selectedElement || !templateElements) return;
    
    const element = templateElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    let newX = (element.position as any).x;
    
    switch (position) {
      case 'start':
        newX = 0;
        break;
      case 'center':
        newX = (width - (element.size as any).width) / 2;
        break;
      case 'end':
        newX = width - (element.size as any).width;
        break;
    }
    
    updateElementMutation.mutate({
      id: element.id,
      updates: {
        position: {
          x: newX,
          y: (element.position as any).y
        }
      }
    });
  };

  const handleAlignVertical = (position: 'start' | 'center' | 'end') => {
    if (!selectedElement || !templateElements) return;
    
    const element = templateElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    let newY = (element.position as any).y;
    
    switch (position) {
      case 'start':
        newY = 0;
        break;
      case 'center':
        newY = (height - (element.size as any).height) / 2;
        break;
      case 'end':
        newY = height - (element.size as any).height;
        break;
    }
    
    updateElementMutation.mutate({
      id: element.id,
      updates: {
        position: {
          x: (element.position as any).x,
          y: newY
        }
      }
    });
  };

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

  const handleCanvasClick = () => {
    setSelectedElement(null);
    
    const event = new CustomEvent('element-deselected');
    document.dispatchEvent(event);
  };

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

  useEffect(() => {
    const handleAddElement = (event: Event) => {
      const customEvent = event as CustomEvent;
      const elementType = customEvent.detail.type;
      
      switch (elementType) {
        case 'text':
          document.dispatchEvent(new CustomEvent('add-text-element'));
          break;
        case 'image':
          document.dispatchEvent(new CustomEvent('add-image-element'));
          break;
        case 'barcode':
          document.dispatchEvent(new CustomEvent('add-barcode-element'));
          break;
        case 'shape':
          document.dispatchEvent(new CustomEvent('add-shape-element'));
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
  }, []);

  const renderResizeHandles = (elementId: string) => {
    if (selectedElement !== elementId) return null;
    
    const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
    return directions.map(dir => {
      const handleStyle: React.CSSProperties = {
        position: 'absolute',
        width: '8px',
        height: '8px',
        backgroundColor: 'white',
        border: '1px solid #0284c7',
        cursor: `${dir}-resize`
      };
      
      switch (dir) {
        case 'n': 
          handleStyle.top = '-4px';
          handleStyle.left = 'calc(50% - 4px)';
          break;
        case 'ne':
          handleStyle.top = '-4px';
          handleStyle.right = '-4px';
          break;
        case 'e':
          handleStyle.top = 'calc(50% - 4px)';
          handleStyle.right = '-4px';
          break;
        case 'se':
          handleStyle.bottom = '-4px';
          handleStyle.right = '-4px';
          break;
        case 's':
          handleStyle.bottom = '-4px';
          handleStyle.left = 'calc(50% - 4px)';
          break;
        case 'sw':
          handleStyle.bottom = '-4px';
          handleStyle.left = '-4px';
          break;
        case 'w':
          handleStyle.top = 'calc(50% - 4px)';
          handleStyle.left = '-4px';
          break;
        case 'nw':
          handleStyle.top = '-4px';
          handleStyle.left = '-4px';
          break;
      }
      
      return (
        <div
          key={`${elementId}-${dir}`}
          style={handleStyle}
          onMouseDown={(e) => handleResizeStart(e, elementId, dir)}
        />
      );
    });
  };

  const renderHorizontalRuler = () => {
    if (!showRulers) return null;
    
    const rulerHeight = 20;
    const scaledWidth = width * (zoomLevel / 100);
    const majorTick = 10;
    const minorTick = 5;
    const numTicks = Math.floor(width / minorTick);
    
    return (
      <div 
        className="absolute left-0 top-0 bg-gray-100 border-b border-r border-gray-300"
        style={{
          height: `${rulerHeight}px`,
          width: `${scaledWidth}px`,
          overflow: 'hidden',
          zIndex: 10
        }}
      >
        {Array.from({ length: numTicks }).map((_, i) => (
          <div
            key={`h-tick-${i}`}
            className={cn(
              "absolute top-0 h-full border-l border-gray-300",
              i % 2 === 0 ? "h-1/2" : "h-1/4"
            )}
            style={{
              left: `${(i * minorTick * (zoomLevel / 100))}px`,
              borderLeftWidth: i % (majorTick / minorTick) === 0 ? '1px' : '0.5px'
            }}
          >
            {i % (majorTick / minorTick) === 0 && (
              <span 
                className="absolute top-0 left-1 text-xs text-gray-600"
                style={{ fontSize: '8px' }}
              >
                {i * minorTick}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderVerticalRuler = () => {
    if (!showRulers) return null;
    
    const rulerWidth = 20;
    const scaledHeight = height * (zoomLevel / 100);
    const majorTick = 10;
    const minorTick = 5;
    const numTicks = Math.floor(height / minorTick);
    
    return (
      <div 
        className="absolute left-0 top-0 bg-gray-100 border-r border-b border-gray-300"
        style={{
          width: `${rulerWidth}px`,
          height: `${scaledHeight}px`,
          overflow: 'hidden',
          zIndex: 10
        }}
      >
        {Array.from({ length: numTicks }).map((_, i) => (
          <div
            key={`v-tick-${i}`}
            className={cn(
              "absolute left-0 w-full border-t border-gray-300",
              i % 2 === 0 ? "w-1/2" : "w-1/4"
            )}
            style={{
              top: `${(i * minorTick * (zoomLevel / 100))}px`,
              borderTopWidth: i % (majorTick / minorTick) === 0 ? '1px' : '0.5px'
            }}
          >
            {i % (majorTick / minorTick) === 0 && (
              <span 
                className="absolute top-0 left-1 text-xs text-gray-600"
                style={{ fontSize: '8px' }}
              >
                {i * minorTick}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderGrid = () => {
    if (!showGridState) return null;
    
    const gridSize = (gridSettings?.gridSize || 10) * (zoomLevel / 100);
    const numHorizontalLines = Math.floor(height / (gridSettings?.gridSize || 10));
    const numVerticalLines = Math.floor(width / (gridSettings?.gridSize || 10));
    
    return (
      <>
        {Array.from({ length: numHorizontalLines + 1 }).map((_, i) => (
          <div
            key={`h-grid-${i}`}
            className="absolute left-0 w-full border-t border-gray-200"
            style={{
              top: `${i * gridSize}px`,
              borderTopWidth: '0.5px'
            }}
          />
        ))}
        
        {Array.from({ length: numVerticalLines + 1 }).map((_, i) => (
          <div
            key={`v-grid-${i}`}
            className="absolute top-0 h-full border-l border-gray-200"
            style={{
              left: `${i * gridSize}px`,
              borderLeftWidth: '0.5px'
            }}
          />
        ))}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleAddTextElement()}
            title="Add Text"
          >
            <Text size={16} />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleAddImageElement()}
            title="Add Image"
          >
            <Image size={16} />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleAddBarcodeElement()}
            title="Add Barcode or QR Code"
          >
            <SquarePlus size={16} />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleDeleteElement}
            title="Delete Selected Element"
            disabled={!selectedElement}
          >
            <Trash size={16} />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowRulers(!showRulers)}
            className={showRulers ? 'bg-blue-100' : ''}
            title="Toggle Rulers"
          >
            <Ruler size={16} />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowGridState(!showGridState)}
            className={showGridState ? 'bg-blue-100' : ''}
            title="Toggle Grid"
          >
            <Grid3x3 size={16} />
          </Button>
          
          <ZoomControls 
            zoomLevel={zoomLevel}
            onZoomIn={() => setZoomLevel(Math.min(500, zoomLevel + 10))}
            onZoomOut={() => setZoomLevel(Math.max(25, zoomLevel - 10))}
            onZoomReset={() => setZoomLevel(100)}
          />
        </div>
      </div>
      
      <div 
        className="relative flex-1 overflow-auto bg-gray-300"
        onWheel={handleWheel}
        onMouseDown={handlePanStart}
        ref={canvasRef}
        onClick={handleCanvasClick}
      >
        <div
          className="absolute bg-white shadow-lg"
          style={{
            width: `${width * (zoomLevel / 100)}px`,
            height: `${height * (zoomLevel / 100)}px`,
            transform: `translate(${canvasPan.x}px, ${canvasPan.y}px)`,
            overflow: 'hidden'
          }}
        >
          {renderGrid()}
          
          {renderHorizontalRuler()}
          {renderVerticalRuler()}
          
          {!isLoading && templateElements && templateElements.map(element => {
            const elementPosition = element.position as any;
            const elementSize = element.size as any;
            const elementProperties = element.properties as any;
            
            const elementStyle: React.CSSProperties = {
              position: 'absolute',
              left: `${elementPosition.x * (zoomLevel / 100)}px`,
              top: `${elementPosition.y * (zoomLevel / 100)}px`,
              width: `${elementSize.width * (zoomLevel / 100)}px`,
              height: `${elementSize.height * (zoomLevel / 100)}px`,
              transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
              cursor: 'move',
              zIndex: element.layer || 0,
              border: selectedElement === element.id ? '1px solid #0284c7' : 'none'
            };
            
            return (
              <div
                key={element.id}
                style={elementStyle}
                onClick={(e) => handleElementClick(element.id, e)}
                onMouseDown={(e) => handleDragStart(e, element.id)}
                onDoubleClick={(e) => handleElementDoubleClick(element.id, element.type, e)}
                className={cn(
                  "select-none overflow-hidden",
                  selectedElement === element.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                )}
              >
                {element.type === 'text' && (
                  <div 
                    style={{
                      fontFamily: elementProperties.fontFamily,
                      fontSize: `${elementProperties.fontSize * (zoomLevel / 100)}px`,
                      fontWeight: elementProperties.fontWeight,
                      fontStyle: elementProperties.fontStyle,
                      textAlign: elementProperties.textAlign,
                      textDecoration: elementProperties.textDecoration,
                      color: elementProperties.color,
                      width: '100%',
                      height: '100%',
                      padding: '4px',
                      overflow: 'hidden'
                    }}
                  >
                    {elementProperties.content}
                  </div>
                )}
                
                {element.type === 'image' && (
                  <img
                    src={elementProperties.src}
                    alt={element.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: elementProperties.objectFit || 'contain'
                    }}
                  />
                )}
                
                {element.type === 'barcode' && (
                  <div className="w-full h-full flex items-center justify-center">
                    {elementProperties.barcodeType === 'qrcode' ? (
                      <div 
                        className="qrcode-placeholder bg-black/90"
                        style={{width: '90%', height: '90%'}}
                        title={elementProperties.content}
                      >
                        <div className="w-full h-full relative">
                          <div className="absolute inset-3 border-4 border-white flex items-center justify-center">
                            <div className="bg-white w-1/3 h-1/3 flex items-center justify-center text-[6px] text-black">
                              QR
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="barcode-placeholder bg-gradient-to-r from-black via-white to-black"
                        style={{width: '100%', height: '50%'}}
                        title={elementProperties.content}
                      />
                    )}
                    {elementProperties.showText && (
                      <div className="absolute bottom-0 text-center w-full text-xs">
                        {elementProperties.content}
                      </div>
                    )}
                  </div>
                )}
                
                {renderResizeHandles(element.id)}
              </div>
            );
          })}
        </div>
      </div>
      
      {showTextEditor && selectedElementData && selectedElementData.type === 'text' && (
        <TextEditor
          open={showTextEditor}
          onOpenChange={setShowTextEditor}
          initialText={(selectedElementData.properties as any)?.content || ''}
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
          initialValue=""
          onSave={handleBarcodeConfigured}
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
