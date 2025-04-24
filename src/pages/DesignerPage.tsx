
import React, { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Canvas from '../components/designer/Canvas';
import Footer from '../components/layout/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const DesignerPage = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    width: 600,
    height: 400
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);

  // Fetch templates
  const { data: templates } = useQuery({
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
  const handleCreateTemplate = async () => {
    if (!newTemplate.name) {
      toast({
        title: 'Error',
        description: 'Template name is required',
        variant: 'destructive'
      });
      return;
    }

    const { data, error } = await supabase
      .from('templates')
      .insert({
        name: newTemplate.name,
        description: newTemplate.description,
        width: newTemplate.width,
        height: newTemplate.height
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error creating template',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Template Created',
      description: `${data.name} has been created successfully`
    });

    setShowCreateDialog(false);
    setSelectedTemplateId(data.id);
    
    // Reset form
    setNewTemplate({
      name: '',
      description: '',
      width: 600,
      height: 400
    });
  };

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
            <Button onClick={handleCreateTemplate}>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DesignerPage;
