
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Trash,
  ArrowUp,
  ArrowDown,
  Copy
} from 'lucide-react';

const ElementsList = () => {
  // Mock data - in a real app, this would come from your state/context
  const elements = [
    { id: 1, type: 'text', name: 'Product Name', content: 'Sample Product' },
    { id: 2, type: 'barcode', name: 'SKU Barcode', content: '123456789' },
    { id: 3, type: 'image', name: 'Logo', content: 'logo.png' }
  ];

  return (
    <div className="space-y-2">
      {elements.map((element) => (
        <div 
          key={element.id}
          className="p-2 border rounded-md bg-white hover:bg-gray-50 flex items-center justify-between"
        >
          <div className="flex items-center">
            <div className="mr-2 w-5 h-5 flex items-center justify-center">
              {element.type === 'text' && (
                <span className="text-xs font-bold">T</span>
              )}
              {element.type === 'barcode' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              )}
              {element.type === 'image' && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>
            <div>
              <div className="text-sm font-medium">{element.name}</div>
              <div className="text-xs text-gray-500 truncate w-36">{element.content}</div>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ArrowUp className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <ArrowDown className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600">
              <Trash className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
      {elements.length === 0 && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No elements added yet
        </div>
      )}
    </div>
  );
};

export default ElementsList;
