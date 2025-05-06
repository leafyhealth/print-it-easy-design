
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Printer, Save, Settings, User, Edit, Trash2, LogOut } from "lucide-react";
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

  // State for the user authentication
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [hasSelectedTemplate, setHasSelectedTemplate] = useState(false);
  
  // State for edit template dialog
  const [templateData, setTemplateData] = useState({
    name: '',
    description: '',
  });

  // Check if user is authenticated and if a template is selected
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );

    // Check if a template is selected
    const templateId = getTemplateId();
    setHasSelectedTemplate(!!templateId);

    // Listen for template selection changes
    const handleTemplateChange = () => {
      const templateId = getTemplateId();
      setHasSelectedTemplate(!!templateId);
    };

    window.addEventListener('popstate', handleTemplateChange);
    
    // Custom event for template selection
    document.addEventListener('template-selected', handleTemplateChange);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener('popstate', handleTemplateChange);
      document.removeEventListener('template-selected', handleTemplateChange);
    };
  }, []);

  // Load template data when edit dialog is opened
  React.useEffect(() => {
    if (isEditDialogOpen) {
      const fetchTemplateData = async () => {
        const templateId = getTemplateId();
        if (templateId) {
          const { data, error } = await supabase
            .from('templates')
            .select('name, description')
            .eq('id', templateId)
            .single();
          
          if (error) {
            toast({
              title: "Failed to load template data",
              description: error.message,
              variant: "destructive"
            });
            return;
          }
          
          if (data) {
            setTemplateData({
              name: data.name || '',
              description: data.description || '',
            });
          }
        }
      };
      
      fetchTemplateData();
    }
  }, [isEditDialogOpen]);

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save templates",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    if (isDesignerPage) {
      const templateId = getTemplateId();
      
      if (!templateId) {
        toast({
          title: "No template selected",
          description: "Please select or create a template first.",
          variant: "destructive"
        });
        return;
      }

      setIsLoading(true);
      
      try {
        // Save template to the database
        const { error } = await supabase
          .from('templates')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', templateId);
        
        if (error) throw error;
        
        queryClient.invalidateQueries({ queryKey: ['template', templateId] });
        queryClient.invalidateQueries({ queryKey: ['template-elements', templateId] });
        
        toast({
          title: "Template saved",
          description: "Your template has been saved successfully.",
        });
        
        // Dispatch custom event for any listeners that need to know about the save
        document.dispatchEvent(new CustomEvent('template-saved', { detail: { templateId } }));
      } catch (error: any) {
        toast({
          title: "Save failed",
          description: error.message || "An unexpected error occurred",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Save functionality",
        description: "Save functionality is only available in the designer.",
      });
    }
  };

  const handlePrint = async () => {
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

  const handleEditTemplate = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to edit templates",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    if (isDesignerPage) {
      const templateId = getTemplateId();
      if (templateId) {
        setIsEditDialogOpen(true);
      } else {
        toast({
          title: "No template selected",
          description: "Please select a template first to edit its properties.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveTemplateChanges = async () => {
    const templateId = getTemplateId();
    if (!templateId) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('templates')
        .update({
          name: templateData.name,
          description: templateData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      
      toast({
        title: "Template updated",
        description: "Template properties have been updated successfully.",
      });
      
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update template properties",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to delete templates",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    if (isDesignerPage) {
      const templateId = getTemplateId();
      if (templateId) {
        // Show confirmation dialog
        if (window.confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
          setIsLoading(true);
          
          try {
            // First delete template elements
            const { error: elementsError } = await supabase
              .from('template_elements')
              .delete()
              .eq('template_id', templateId);
            
            if (elementsError) throw elementsError;
            
            // Then delete the template
            const { error: templateError } = await supabase
              .from('templates')
              .delete()
              .eq('id', templateId);
            
            if (templateError) throw templateError;
            
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            
            toast({
              title: "Template deleted",
              description: "The template has been deleted successfully.",
            });
            
            navigate('/designer'); // Redirect to designer page without template
          } catch (error: any) {
            toast({
              title: "Delete failed",
              description: error.message || "Failed to delete template",
              variant: "destructive"
            });
          } finally {
            setIsLoading(false);
          }
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

  const handleSettingsClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to access settings",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    setIsSettingsDialogOpen(true);
  };

  const handleUserProfileClick = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to view your profile",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    setIsProfileDialogOpen(true);
  };

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "Failed to log out",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1" 
                onClick={handleEditTemplate}
                disabled={isLoading || !hasSelectedTemplate}
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 text-red-500" 
                onClick={handleDeleteTemplate}
                disabled={isLoading || !hasSelectedTemplate}
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1" 
            onClick={handleSave}
            disabled={isLoading || (isDesignerPage && !hasSelectedTemplate)}
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1" 
            onClick={handlePrint}
            disabled={isLoading || (isDesignerPage && !hasSelectedTemplate)}
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleSettingsClick}
            disabled={isLoading}
          >
            <Settings className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleUserProfileClick}
              disabled={isLoading}
            >
              {user ? (
                <div className="h-6 w-6 rounded-full bg-designer-primary text-white flex items-center justify-center">
                  {user.email ? user.email[0].toUpperCase() : <User className="h-5 w-5" />}
                </div>
              ) : (
                <User className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Update the details of your template.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={templateData.name}
                onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={templateData.description}
                onChange={(e) => setTemplateData({ ...templateData, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplateChanges} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Settings</DialogTitle>
            <DialogDescription>
              Configure your application preferences
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="">
                Dark Mode
              </Label>
              <input
                id="dark-mode"
                type="checkbox"
                className="toggle"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="">
                Enable Notifications
              </Label>
              <input
                id="notifications"
                type="checkbox"
                className="toggle"
                defaultChecked
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-save" className="">
                Auto-Save (minutes)
              </Label>
              <Input
                id="auto-save"
                type="number"
                defaultValue="5"
                min="0"
                className="w-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Settings Saved",
                description: "Your settings have been saved successfully.",
              });
              setIsSettingsDialogOpen(false);
            }}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              Your account information
            </DialogDescription>
          </DialogHeader>
          {user && (
            <div className="py-4">
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-designer-primary text-white flex items-center justify-center text-xl mb-2">
                  {user.email ? user.email[0].toUpperCase() : "U"}
                </div>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm mt-1">{user.email}</p>
                </div>
                <div>
                  <Label>Account Created</Label>
                  <p className="text-sm mt-1">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Button 
                  variant="destructive" 
                  className="w-full gap-2" 
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  <LogOut className="h-4 w-4" />
                  {isLoading ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
