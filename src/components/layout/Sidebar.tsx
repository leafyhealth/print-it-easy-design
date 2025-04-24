
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Barcode, 
  Image, 
  Layers, 
  Settings as SettingsIcon,
  FileText, 
  Plus, 
  Search,
  Text 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import ElementProperties from '../designer/ElementProperties';
import ElementsList from '../designer/ElementsList';

interface Template {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
}

interface SidebarProps {
  templates?: Template[];
  onCreateTemplate?: () => void;
  onSelectTemplate?: (id: string) => void;
  selectedTemplateId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  templates = [], 
  onCreateTemplate, 
  onSelectTemplate,
  selectedTemplateId 
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-sidebar border-r">
      <Tabs defaultValue="elements" className="flex-1 flex flex-col">
        <div className="p-3 border-b">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="elements">
              <Layers className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="objects">
              <Plus className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="settings">
              <SettingsIcon className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </div>
        
        <ScrollArea className="flex-1">
          <TabsContent value="elements" className="p-4 mt-0">
            <h3 className="font-medium mb-3">Elements</h3>
            <ElementsList templateId={selectedTemplateId} />
            <div className="mt-5">
              <h3 className="font-medium mb-3">Properties</h3>
              <ElementProperties />
            </div>
          </TabsContent>

          <TabsContent value="templates" className="p-4 mt-0">
            <div className="flex items-center mb-3">
              <h3 className="font-medium">Templates</h3>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={onCreateTemplate}>
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search templates..." className="pl-8" />
            </div>
            <div className="space-y-2">
              {templates.map((template) => (
                <div 
                  key={template.id}
                  className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 ${selectedTemplateId === template.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  onClick={() => onSelectTemplate?.(template.id)}
                >
                  <div className="font-medium">{template.name}</div>
                  {template.description && (
                    <div className="text-sm text-gray-500 truncate">{template.description}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">{template.width}x{template.height}px</div>
                </div>
              ))}
              {templates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No templates found</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={onCreateTemplate}
                  >
                    Create Template
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="objects" className="p-4 mt-0">
            <h3 className="font-medium mb-3">Add Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="h-20 flex-col justify-center"
                onClick={() => {
                  const event = new CustomEvent('add-element', { 
                    detail: { type: 'text' } 
                  });
                  document.dispatchEvent(event);
                }}
              >
                <Text className="h-6 w-6 mb-1" />
                <span>Text</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col justify-center"
                onClick={() => {
                  const event = new CustomEvent('add-element', { 
                    detail: { type: 'barcode' } 
                  });
                  document.dispatchEvent(event);
                }}
              >
                <Barcode className="h-6 w-6 mb-1" />
                <span>Barcode</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col justify-center"
                onClick={() => {
                  const event = new CustomEvent('add-element', { 
                    detail: { type: 'image' } 
                  });
                  document.dispatchEvent(event);
                }}
              >
                <Image className="h-6 w-6 mb-1" />
                <span>Image</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col justify-center"
                onClick={() => {
                  const event = new CustomEvent('add-element', { 
                    detail: { type: 'shape' } 
                  });
                  document.dispatchEvent(event);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 4a1 1 0 011-1h8a1 1 0 011 1v4a1 1 0 01-1 1H6a1 1 0 01-1-1V4zm4 8a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Shape</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="p-4 mt-0">
            <h3 className="font-medium mb-3">Label Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Label Size</label>
                <select className="w-full mt-1 px-3 py-2 bg-background border rounded-md">
                  <option>4" x 6" - Shipping</option>
                  <option>3" x 2" - Name Tag</option>
                  <option>2" x 1" - Barcode</option>
                  <option>Custom Size</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Orientation</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Button variant="outline" className="justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    Portrait
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    Landscape
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Grid Settings</label>
                <div className="flex items-center mt-1">
                  <input type="checkbox" id="show-grid" className="mr-2" defaultChecked />
                  <label htmlFor="show-grid" className="text-sm">Show grid</label>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Units</label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <Button size="sm" variant="outline">Inches</Button>
                  <Button size="sm" variant="outline">MM</Button>
                  <Button size="sm" variant="outline">Pixels</Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default Sidebar;
