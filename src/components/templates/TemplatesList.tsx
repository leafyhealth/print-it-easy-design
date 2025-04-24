
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";

const TemplatesList = () => {
  // Mock data - in a real app, this would come from API or context
  const templates = [
    { id: 1, name: 'Shipping Label', description: '4×6″ shipping label with barcode', lastModified: '2023-04-24' },
    { id: 2, name: 'Product Tag', description: '3×2″ product price tag', lastModified: '2023-04-22' },
    { id: 3, name: 'Return Label', description: '4×6″ return shipping label', lastModified: '2023-04-20' },
  ];
  
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
              <div className="text-xs text-gray-500 mt-1">Last modified: {template.lastModified}</div>
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
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
