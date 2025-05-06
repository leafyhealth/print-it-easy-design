
import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import Canvas from '../components/designer/Canvas';
import Footer from '../components/layout/Footer';
import PaperTemplateSelector from '../components/designer/PaperTemplateSelector';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import VisualAidTools from '../components/designer/VisualAidTools';

// Skip storage bucket creation attempt since it's causing issues
const skipStorageCreation = true;

const DesignerPage = () => {
  const queryClient = useQueryClient();
  const [showPaperTemplateSelector, setShowPaperTemplateSelector] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Visual aid states
  const [showGrid, setShowGrid] = useState(true);
  const [showRulers, setShowRulers] = useState(true);
  const [showSnaplines, setShowSnaplines] = useState(true);
  const [showMargins, setShowMargins] = useState(true);

  // Check URL for template parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const templateId = urlParams.get('template');
    if (templateId) {
      setSelectedTemplateId(templateId);
      
      // Dispatch event to notify other components about template selection
      document.dispatchEvent(new CustomEvent('template-selected', { 
        detail: { templateId }
      }));
    }
  }, []);

  // Check if user is authenticated
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // If user is logged in but no template is selected, show the paper template dialog
        if (user && !selectedTemplateId) {
          setShowPaperTemplateSelector(true);
        }
        
        setIsInitializing(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsInitializing(false);
        toast({
          title: 'Authentication Error',
          description: 'Failed to check your login status. Please try again.',
          variant: 'destructive'
        });
      }
    };

    getUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [selectedTemplateId]);

  // Fetch templates
  const { data: templates, isLoading: isLoadingTemplates, error: templatesError } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        return data || [];
      } catch (error: any) {
        console.error('Error fetching templates:', error);
        toast({
          title: 'Error fetching templates',
          description: error.message || 'Failed to load templates',
          variant: 'destructive'
        });
        return [];
      }
    },
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
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
      horizontalGap?: number;
      verticalGap?: number;
      cornerRadius?: number;
    }) => {
      // Check if user is authenticated
      if (!user) {
        throw new Error('You must be logged in to create a template');
      }

      // Unit conversion
      let widthInPixels = templateSettings.labelWidth;
      let heightInPixels = templateSettings.labelHeight;
      let horizontalGapPx = templateSettings.horizontalGap || 0;
      let verticalGapPx = templateSettings.verticalGap || 0;
      let cornerRadiusPx = templateSettings.cornerRadius || 0;
      
      if (templateSettings.unit === 'in') {
        widthInPixels = templateSettings.labelWidth * 96;
        heightInPixels = templateSettings.labelHeight * 96;
        horizontalGapPx = (templateSettings.horizontalGap || 0) * 96;
        verticalGapPx = (templateSettings.verticalGap || 0) * 96;
        cornerRadiusPx = (templateSettings.cornerRadius || 0) * 96;
      } else if (templateSettings.unit === 'mm') {
        widthInPixels = templateSettings.labelWidth * 3.78;
        heightInPixels = templateSettings.labelHeight * 3.78;
        horizontalGapPx = (templateSettings.horizontalGap || 0) * 3.78;
        verticalGapPx = (templateSettings.verticalGap || 0) * 3.78;
        cornerRadiusPx = (templateSettings.cornerRadius || 0) * 3.78;
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
            horizontalGap: Math.round(horizontalGapPx),
            verticalGap: Math.round(verticalGapPx),
            cornerRadius: Math.round(cornerRadiusPx)
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
      
      // Dispatch event to notify other components about template selection
      document.dispatchEvent(new CustomEvent('template-selected', { 
        detail: { templateId: data.id }
      }));
      
      // Update URL with new template ID
      const url = new URL(window.location.href);
      url.searchParams.set('template', data.id);
      window.history.pushState({}, '', url.toString());
      
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

  // Handle template selection from sidebar
  const handleTemplateSelection = (id: string) => {
    setSelectedTemplateId(id);
    
    // Update URL with selected template ID
    const url = new URL(window.location.href);
    url.searchParams.set('template', id);
    window.history.pushState({}, '', url.toString());
    
    // Dispatch event to notify other components about template selection
    document.dispatchEvent(new CustomEvent('template-selected', { 
      detail: { templateId: id }
    }));
  };

  // Alignment handlers for the VisualAidTools component
  const handleAlignHorizontal = (position: 'start' | 'center' | 'end') => {
    document.dispatchEvent(new CustomEvent('align-horizontal', { detail: { position } }));
  };

  const handleAlignVertical = (position: 'start' | 'center' | 'end') => {
    document.dispatchEvent(new CustomEvent('align-vertical', { detail: { position } }));
  };

  // Show error state if templates failed to load
  if (templatesError) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center p-6 max-w-md">
            <h2 className="text-xl font-bold mb-2">Error Loading Templates</h2>
            <p className="text-gray-600 mb-4">Failed to load templates. Please try again later.</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['templates'] })}>
              Retry
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If initializing, show loading screen
  if (isInitializing) {
    return (
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-lg font-medium">Initializing...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72">
          <Sidebar 
            templates={templates || []} 
            onCreateTemplate={() => setShowPaperTemplateSelector(true)}
            onSelectTemplate={handleTemplateSelection}
            selectedTemplateId={selectedTemplateId}
          />
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-2 border-b bg-gray-50">
            <VisualAidTools 
              showGrid={showGrid}
              showRulers={showRulers}
              showSnaplines={showSnaplines}
              showMargins={showMargins}
              onToggleGrid={() => setShowGrid(!showGrid)}
              onToggleRulers={() => setShowRulers(!showRulers)}
              onToggleSnaplines={() => setShowSnaplines(!showSnaplines)}
              onToggleMargins={() => setShowMargins(!showMargins)}
              onAlignHorizontal={handleAlignHorizontal}
              onAlignVertical={handleAlignVertical}
            />
          </div>
          <div className="flex-1">
            {selectedTemplateId ? (
              <Canvas 
                width={templates?.find(t => t.id === selectedTemplateId)?.width || 600}
                height={templates?.find(t => t.id === selectedTemplateId)?.height || 400}
                showGrid={showGrid} 
                templateId={selectedTemplateId}
                showMargins={showMargins}
                showRulers={showRulers}
                showSnaplines={showSnaplines}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-100">
                <div className="text-center p-6">
                  <h2 className="text-2xl font-bold mb-2">Welcome to PrintEasy</h2>
                  <p className="text-gray-600 mb-4">Select a template or create a new one to get started.</p>
                  <Button onClick={() => setShowPaperTemplateSelector(true)}>Create New Template</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* Paper/Label Template Selector */}
      <PaperTemplateSelector
        open={showPaperTemplateSelector}
        onOpenChange={setShowPaperTemplateSelector}
        onConfirm={(templateSettings) => createTemplateMutation.mutate(templateSettings)}
      />

      {isLoadingTemplates && selectedTemplateId && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Loading templates...</span>
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
