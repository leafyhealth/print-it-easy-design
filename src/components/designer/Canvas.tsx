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
  // ... keep existing code (function and state declarations)
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
  
  // Canvas view settings
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showRulers, setShowRulers] = useState(true);
  const [showSnaplines, setShowSnaplines] = useState(true);
  const [showMargins, setShowMargins] = useState(true);
  const [showGridState, setShowGridState] = useState(initialShowGrid);
  const [canvasPan, setCanvasPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStartPos, setPanStartPos] = useState({ x: 0, y: 0 });

  // Fetch template elements
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

  // Extract grid settings from the template
  const gridSettings: GridSettings = template?.grid_settings ? 
    (typeof template.grid_settings === 'string' 
      ? JSON.parse(template.grid_settings) 
      : template.grid_settings as unknown as GridSettings) 
    : { showGrid: true, gridSize: 10 };

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

  // ... keep existing code (selected element and mutations)
  // Get the selected element
  const selectedElementData = templateElements?.find(
    (element) => element.id === selectedElement
  );

  // Mutation to add a new element
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

  // Mutation to update an element
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
  
  // Add an image element
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
  
  // Handle image selection from uploader
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
  
  // Add a barcode element
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
  
  // Handle barcode configuration
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
  
  // ... keep existing code (element editing methods)
  // Edit text element
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
  
  // Save text changes
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
  
  // Delete selected element
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

  // ... keep existing code (event handlers)
  // Double click to edit elements
  const handleElementDoubleClick = (elementId: string, elementType: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    
    switch (elementType) {
      case 'text':
        setShowTextEditor(true);
        break;
      case 'image':
        // Open image editor or image selector
        setShowImageUploader(true);
        break;
      case 'barcode':
        setShowBarcodeEditor(true);
        break;
      default:
        break;
    }
  };
  
  // Handle element selection
  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(elementId);
    
    // Let parent components know about selection
    const event = new CustomEvent('element-selected', { 
      detail: { elementId } 
    });
    document.dispatchEvent(event);
  };
  
  // Handle drag start
  const handleDragStart = (e: React.MouseEvent, elementId: string) => {
    if (!selectedElement || selectedElement !== elementId) {
      setSelectedElement(elementId);
      
      // Let parent components know about selection
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
    
    // Prevent default to disable browser's drag behavior
    e.preventDefault();
  };
  
  // Handle drag
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
  }, [isDragging, selectedElement, dragStartPos, templateElements, queryClient, templateId, zoomLevel]);
  
  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!isDragging || !selectedElement || !templateElements) return;
    
    const element = templateElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    // Save final position to database
    updateElementMutation.mutate({ 
      id: element.id, 
      updates: { position: element.position as any } 
    });
    
    setIsDragging(false);
  }, [isDragging, selectedElement, templateElements, updateElementMutation]);
  
  // Handle resize start
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

  // ... keep existing code (resizing, panning, etc.)
  // Handle resize
  const handleResize = useCallback((e: MouseEvent) => {
    if (!isResizing || !selectedElement || !templateElements || !resizeStartData) return;
    
    const element = templateElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    let newWidth = resizeStartData.startWidth;
    let newHeight = resizeStartData.startHeight;
    
    const deltaX = (e.clientX - resizeStartData.startX) / (zoomLevel / 100);
    const deltaY = (e.clientY - resizeStartData.startY) / (zoomLevel / 100);
    
    // Calculate new dimensions based on resize direction
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
    
    // Update element size visually (optimistic update)
    const updatedElements = templateElements.map(el => {
      if (el.id === selectedElement) {
        const newElement = { ...el };
        newElement.size = { width: newWidth, height: newHeight };
        
        // If resizing from left or top, also adjust position
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
    
    // Update queryClient cache for immediate visual feedback
    queryClient.setQueryData(['template-elements', templateId], updatedElements);
  }, [isResizing, selectedElement, resizeStartData, templateElements, queryClient, templateId, zoomLevel]);
  
  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    if (!isResizing || !selectedElement || !templateElements) return;
    
    const element = templateElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    // Save final size to database
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
  
  // Handle canvas panning start
  const handlePanStart = (e: React.MouseEvent) => {
    // Only start panning with middle mouse button (button 1)
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStartPos({ x: e.clientX, y: e.clientY });
      e.preventDefault();
    }
  };
  
  // Handle canvas panning
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
  
  // Handle canvas panning end
  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // ... keep existing code (zoom, lifecycle events)
  // Handle wheel with mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 10 : -10;
      const newZoom = Math.max(25, Math.min(500, zoomLevel + delta));
      setZoomLevel(newZoom);
    }
  };

  // Zoom to fit document
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
  
  // Zoom to fit all objects
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
    
    // Add padding
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
    
    // Center objects
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    setCanvasPan({
      x: (canvasWidth / 2) - (centerX * (scale / 100)),
      y: (canvasHeight / 2) - (centerY * (scale / 100))
    });
  };

  // ... keep existing code (alignment methods)
  // Align selected elements horizontally
  const handleAlignHorizontal = (position: 'start' | 'center' | 'end') => {
    if (!selectedElement || !templateElements) return;
    
    const element = templateElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    let newX = (element.position as any).x;
    
    switch (position) {
      case 'start': // Left align
        newX = 0;
        break;
      case 'center': // Center align
        newX = (width - (element.size as any).width) / 2;
        break;
      case 'end': // Right align
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
  
  // Align selected elements vertically
  const handleAlignVertical = (position: 'start' | 'center' | 'end') => {
    if (!selectedElement || !templateElements) return;
    
    const element = templateElements.find(el => el.id === selectedElement);
    if (!element) return;
    
    let newY = (element.position as any).y;
    
    switch (position) {
      case 'start': // Top align
        newY = 0;
        break;
      case 'center': // Middle align
        newY = (height - (element.size as any).height) / 2;
        break;
      case 'end': // Bottom align
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

  // ... keep existing code (effects)
  // Set up mouse move and mouse up event listeners for dragging and resizing
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

  // Handle canvas click (deselect)
  const handleCanvasClick = () => {
    setSelectedElement(null);
    
    // Let parent components know about deselection
    const event = new CustomEvent('element-deselected');
    document.dispatchEvent(event);
  };
  
  // ... keep existing code (keyboard shortcuts)
  // Add event listeners for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // We're removing the automatic delete functionality when Delete key is pressed
      // as requested by the user
      
      // Ctrl+Z for undo (would need proper undo/redo implementation)
      if (e.key === 'z' && e.ctrlKey) {
        e.preventDefault();
        // Implement undo functionality
      }
      
      // Ctrl+Y or Ctrl+Shift+Z for redo
      if ((e.key === 'y' && e.ctrlKey) || (e.key === 'z' && e.ctrlKey && e.shiftKey)) {
        e.preventDefault();
        // Implement redo functionality
      }
      
      // Arrow keys for nudging selected elements
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

  // ... keep existing code (document resize)
  // Listen for document resize to adjust zoom
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

  // ... keep existing code (document events)
  // Add event listeners for component control from parent components
  useEffect(() => {
    const handleAddElement = (event: Event) => {
      const customEvent = event as CustomEvent;
      const elementType = customEvent.detail.type;
      
      // The logic to add specific element types is in Canvas.tsx
      // So we trigger the appropriate method there
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

  // ... keep existing code (resize handlers)
  // Render resize handles for selected element
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
      
      // Position handles based on direction
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

  // ... keep existing code (rulers)
  // Render horizontal ruler
  const renderHorizontalRuler = () => {
    if (!showRulers) return null;
    
    const rulerHeight = 20;
    const scaledWidth = width * (zoomLevel / 100);
    const majorTick = 10; // Pixels between major ticks at 100% zoom
    const minorTick = 5; // Pixels between minor ticks at 100% zoom
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
        {Array.from({ length: numTicks }).map((_, i) => {
