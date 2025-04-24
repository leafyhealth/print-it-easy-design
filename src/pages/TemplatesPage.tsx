
import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

const TemplatesPage = () => {
  // Mock data for templates
  const templates = [
    { 
      id: 1, 
      name: 'Shipping Label', 
      description: 'Standard shipping label with barcode', 
      thumbnail: 'https://via.placeholder.com/150?text=Shipping',
      lastModified: '3 days ago'
    },
    { 
      id: 2, 
      name: 'Product Tag', 
      description: 'Small product tag with price and barcode', 
      thumbnail: 'https://via.placeholder.com/150?text=Product',
      lastModified: '1 week ago'
    },
    { 
      id: 3, 
      name: 'Return Label', 
      description: 'Return shipping label with instructions', 
      thumbnail: 'https://via.placeholder.com/150?text=Return',
      lastModified: '2 weeks ago'
    },
    { 
      id: 4, 
      name: 'Address Label', 
      description: 'Simple address label', 
      thumbnail: 'https://via.placeholder.com/150?text=Address',
      lastModified: '1 month ago'
    },
  ];
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-auto p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Label Templates</h1>
            <Button asChild>
              <Link to="/designer">
                <Plus className="mr-2 h-4 w-4" />
                New Template
              </Link>
            </Button>
          </div>
          
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search templates..." className="pl-10" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {templates.map(template => (
              <div key={template.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-1 border-b bg-gray-50">
                  <img 
                    src={template.thumbnail} 
                    alt={template.name} 
                    className="w-full h-32 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                  <p className="text-xs text-gray-400 mt-2">Modified {template.lastModified}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="default" size="sm" asChild className="flex-1">
                      <Link to={`/designer?template=${template.id}`}>
                        Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Print
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="bg-gray-50 rounded-lg border border-dashed flex flex-col items-center justify-center p-6 hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-designer-primary/10 flex items-center justify-center mb-2">
                <Plus className="h-6 w-6 text-designer-primary" />
              </div>
              <p className="font-medium text-gray-600">Create New Template</p>
              <p className="text-sm text-gray-500 mt-1 text-center">Start from scratch or choose a template</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TemplatesPage;
