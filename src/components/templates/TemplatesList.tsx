
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const TemplatesList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch templates from Supabase
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

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId);
        
      if (error) throw error;
      return templateId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({ title: 'Template deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ 
        title: 'Failed to delete template', 
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleEdit = (templateId: string) => {
    navigate(`/designer?template=${templateId}`);
  };

  const handleDelete = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(templateId);
    }
  };
  
  if (isLoading) {
    return <div className="text-center py-8">Loading templates...</div>;
  }
  
  if (!templates || templates.length === 0) {
    return <div className="text-center py-8 text-gray-500">No templates found. Create your first template!</div>;
  }
  
  return (
    <div className="space-y-2">
      {templates.map(template => (
        <div 
          key={template.id}
          className="p-3 border rounded-md bg-white hover:bg-gray-50"
        >
          <div className="flex justify-between">
            <div>
              <div className="font-medium">{template.name}</div>
              <div className="text-xs text-gray-500">{template.description}</div>
              <div className="text-xs text-gray-500 mt-1">
                Last modified: {new Date(template.updated_at).toLocaleDateString()}
              </div>
            </div>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => handleEdit(template.id)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-600"
                onClick={(e) => handleDelete(template.id, e)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplatesList;
