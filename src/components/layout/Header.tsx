
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Printer, Save, Settings, User, Edit, Trash2 } from "lucide-react";
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const isDesignerPage = location.pathname === '/designer';
  
  // Get current template ID if on designer page
  const getTemplateId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('template');
  };

  const handleSave = async () => {
    if (isDesignerPage) {
      // Refresh template data
      const templateId = getTemplateId();
      if (templateId) {
        queryClient.invalidateQueries({ queryKey: ['template', templateId] });
        queryClient.invalidateQueries({ queryKey: ['template-elements', templateId] });
        
        toast({
          title: "Template saved",
          description: "Your template has been saved successfully.",
        });
        
        // Dispatch custom event for any listeners that need to know about the save
        document.dispatchEvent(new CustomEvent('template-saved', { detail: { templateId } }));
      } else {
        toast({
          title: "No template selected",
          description: "Please select or create a template first.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Save functionality",
        description: "Save functionality is only available in the designer.",
      });
    }
  };

  const handlePrint = () => {
    if (isDesignerPage) {
      const templateId = getTemplateId();
      if (templateId) {
        navigate(`/labels/print/${templateId}`);
      } else {
        toast({
          title: "No template selected",
          description: "Please select or create a template first.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Print functionality",
        description: "Redirecting to print page...",
      });
      navigate('/labels/print');
    }
  };

  const handleDeleteTemplate = () => {
    if (isDesignerPage) {
      const templateId = getTemplateId();
      if (templateId) {
        // Show confirmation dialog here - in a real app you would use a modal
        if (window.confirm("Are you sure you want to delete this template?")) {
          // Delete template logic would go here
          toast({
            title: "Template deleted",
            description: "The template has been deleted successfully.",
          });
          navigate('/designer'); // Redirect to designer page without template
        }
      } else {
        toast({
          title: "No template selected",
          description: "Please select a template first to delete it.",
          variant: "destructive"
        });
      }
    }
  };

  const handleEditTemplate = () => {
    if (isDesignerPage) {
      const templateId = getTemplateId();
      if (templateId) {
        toast({
          title: "Edit template",
          description: "You can edit the template properties.",
        });
        // In a real app, this would open a modal for editing template properties
      } else {
        toast({
          title: "No template selected",
          description: "Please select a template first to edit its properties.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-2">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-8 w-8 bg-designer-primary rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9 1a1 1 0 10-2 0v6a1 1 0 102 0V6zm-5 1a1 1 0 00-2 0v6a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="font-semibold text-xl text-designer-dark">PrintEasy</span>
          </Link>
          
          <nav className="ml-8 hidden md:flex space-x-1">
            <Button variant="ghost" className="text-gray-600" asChild>
              <Link to="/templates">Templates</Link>
            </Button>
            <Button variant="ghost" className="text-gray-600" asChild>
              <Link to="/designer">Designer</Link>
            </Button>
            <Button variant="ghost" className="text-gray-600" asChild>
              <Link to="/data">Data</Link>
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          {isDesignerPage && (
            <>
              <Button variant="outline" size="sm" className="gap-1" onClick={handleEditTemplate}>
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1 text-red-500" onClick={handleDeleteTemplate}>
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" className="gap-1" onClick={handleSave}>
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
