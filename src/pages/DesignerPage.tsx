
import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Canvas from '../components/designer/Canvas';
import Footer from '../components/layout/Footer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const DesignerPage = () => {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    width: 600,
    height: 400
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Error fetching templates',
          description: error.message,
          variant: 'destructive'
        });
        return [];
      }

      return data || [];
    }
  });

  // Create a new template
  const createTemplateMutation = useMutation({
    mutationFn: async (template: typeof newTemplate) => {
      const { data, error } = await supabase
        .from('templates')
        .insert({
          name: template.name,
          description: template.description,
          width: template.width,
          height: template.height
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      setSelectedTemplateId(data.id);
      setShowCreateDialog(false);
      
      // Reset form
      setNewTemplate({
        name: '',
        description: '',
        width: 600,
        height: 400
      });
      
      toast({
        title: 'Template Created',
        description: `${data.name} has been created successfully`
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating template',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.name) {
      toast({
        title: 'Error',
        description: 'Template name is required',
        variant: 'destructive'
      });
      return;
    }

    createTemplateMutation.mutate(newTemplate);
  };

  // Handle element addition from sidebar
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
    
    return () => {
      document.removeEventListener('add-element', handleAddElement);
    };
  }, []);

  // Listen for canvas-specific element events
  useEffect(() => {
    const handleAddTextElement = () => {
      const addTextButton = document.querySelector('button:has(.h-4.w-4:first-child)') as HTMLButtonElement | null;
      if (addTextButton) {
        addTextButton.click();
      }
    };
    
    const handleAddImageElement = () => {
      const buttons = document.querySelectorAll('button:has(.h-4.w-4:first-child)');
      if (buttons.length >= 2) {
        (buttons[1] as HTMLButtonElement).click();
      }
    };
    
    const handleAddBarcodeElement = () => {
      const buttons = document.querySelectorAll('button:has(.h-4.w-4:first-child)');
      if (buttons.length >= 3) {
        (buttons[2] as HTMLButtonElement).click();
      }
    };

    document.addEventListener('add-text-element', handleAddTextElement);
    document.addEventListener('add-image-element', handleAddImageElement);
    document.addEventListener('add-barcode-element', handleAddBarcodeElement);
    
    return () => {
      document.removeEventListener('add-text-element', handleAddTextElement);
      document.removeEventListener('add-image-element', handleAddImageElement);
      document.removeEventListener('add-barcode-element', handleAddBarcodeElement);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72">
          <Sidebar 
            templates={templates || []} 
            onCreateTemplate={() => setShowCreateDialog(true)}
            onSelectTemplate={(id) => setSelectedTemplateId(id)}
            selectedTemplateId={selectedTemplateId}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <Canvas 
            width={templates?.find(t => t.id === selectedTemplateId)?.width || 600}
            height={templates?.find(t => t.id === selectedTemplateId)?.height || 400}
            showGrid={true} 
            templateId={selectedTemplateId}
          />
        </div>
      </div>
      <Footer />

      {/* Create template dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>
              Create a new label template with custom dimensions and properties.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">Name</label>
              <Input
                id="name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                className="col-span-3"
                placeholder="Template name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right">Description</label>
              <Textarea
                id="description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                className="col-span-3"
                placeholder="Template description (optional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="width" className="text-right">Width (px)</label>
              <Input
                id="width"
                type="number"
                value={newTemplate.width}
                onChange={(e) => setNewTemplate({...newTemplate, width: parseInt(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="height" className="text-right">Height (px)</label>
              <Input
                id="height"
                type="number"
                value={newTemplate.height}
                onChange={(e) => setNewTemplate({...newTemplate, height: parseInt(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateTemplate} disabled={createTemplateMutation.isPending}>
              {createTemplateMutation.isPending ? 'Creating...' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-lg">
            Loading templates...
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerPage;
