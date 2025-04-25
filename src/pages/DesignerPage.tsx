
import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Canvas from '../components/designer/Canvas';
import Footer from '../components/layout/Footer';
import PaperTemplateSelector from '../components/designer/PaperTemplateSelector';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ensureStorageBucketExists } from '@/lib/setupStorage';

const DesignerPage = () => {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPaperTemplateSelector, setShowPaperTemplateSelector] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<any>(null);

  // Check if user is authenticated and setup storage
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // If user is logged in but no template is selected, show the paper template dialog
      if (user && !selectedTemplateId) {
        setShowPaperTemplateSelector(true);
      }
      
      // Setup storage bucket
      if (user) {
        // Force bucket creation on every page load to ensure it exists
        try {
          const bucketSetup = await ensureStorageBucketExists();
          if (bucketSetup) {
            console.log('Storage bucket is ready for use');
          } else {
            toast({
              title: 'Storage Setup Issue',
              description: 'There was a problem setting up storage. Some features may not work properly.',
              variant: 'destructive'
            });
          }
        } catch (error) {
          console.error('Error setting up storage bucket:', error);
          toast({
            title: 'Storage Setup Error',
            description: 'Failed to set up the storage bucket. Please try again later.',
            variant: 'destructive'
          });
        }
      }
    };

    getUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          await ensureStorageBucketExists();
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [selectedTemplateId]);

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

  // Create a new template with advanced paper configuration
  const createTemplateMutation = useMutation({
    mutationFn: async (templateSettings: {
      name: string;
      description: string;
      paperFormat: string;
      paperWidth: number;
      paperHeight: number;
      unit: string;
      labelLayout: string;
      columns: number;
      rows: number;
      labelWidth: number;
      labelHeight: number;
    }) => {
      // Check if user is authenticated
      if (!user) {
        throw new Error('You must be logged in to create a template');
      }

      // We'll save the template with the width and height in pixels
      // For unit conversion: 1 inch = 96px, 1mm = 3.78px (approximation)
      let widthInPixels = templateSettings.labelWidth;
      let heightInPixels = templateSettings.labelHeight;
      
      if (templateSettings.unit === 'in') {
        widthInPixels = templateSettings.labelWidth * 96;
        heightInPixels = templateSettings.labelHeight * 96;
      } else if (templateSettings.unit === 'mm') {
        widthInPixels = templateSettings.labelWidth * 3.78;
        heightInPixels = templateSettings.labelHeight * 3.78;
      }

      const { data, error } = await supabase
        .from('templates')
        .insert({
          name: templateSettings.name,
          description: templateSettings.description,
          width: Math.round(widthInPixels),
          height: Math.round(heightInPixels),
          user_id: user.id,
          grid_settings: {
            showGrid: true,
            gridSize: 10,
            paperFormat: templateSettings.paperFormat,
            paperWidth: templateSettings.paperWidth,
            paperHeight: templateSettings.paperHeight,
            unit: templateSettings.unit,
            labelLayout: templateSettings.labelLayout,
            columns: templateSettings.columns,
            rows: templateSettings.rows,
            horizontalGap: 0,  // Default gap values
            verticalGap: 0,
            cornerRadius: 0    // Default corner radius
          }
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
      setShowPaperTemplateSelector(false);
      
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

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72">
          <Sidebar 
            templates={templates || []} 
            onCreateTemplate={() => setShowPaperTemplateSelector(true)}
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

      {/* Paper/Label Template Selector */}
      <PaperTemplateSelector
        open={showPaperTemplateSelector}
        onOpenChange={setShowPaperTemplateSelector}
        onConfirm={(templateSettings) => createTemplateMutation.mutate(templateSettings)}
      />

      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md shadow-lg">
            Loading templates...
          </div>
        </div>
      )}

      {!user && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
            <p className="mb-4">You need to be logged in to use the template designer.</p>
            <div className="flex justify-end">
              <Button onClick={() => window.location.href = "/auth"}>
                Log In / Sign Up
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignerPage;
