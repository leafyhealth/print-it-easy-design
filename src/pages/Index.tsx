
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Printer, Layers, Upload } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-2 h-10 w-10 bg-designer-primary rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9 1a1 1 0 10-2 0v6a1 1 0 102 0V6zm-5 1a1 1 0 00-2 0v6a1 1 0 102 0V7z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-bold text-2xl">PrintEasy</span>
          </div>
          
          <div className="space-x-2">
            <Button variant="ghost">Login</Button>
            <Button>Get Started</Button>
          </div>
        </div>
      </header>
      
      <main>
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Professional Label Design<br />
              <span className="text-designer-primary">Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Create, customize, and print stunning labels for your business with our easy-to-use drag-and-drop designer.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild className="px-8">
                <Link to="/designer">Start Designing</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8">
                <Link to="/templates">Browse Templates</Link>
              </Button>
            </div>
          </div>
        </section>
        
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <img
                src="https://via.placeholder.com/800x400?text=Label+Designer+Preview"
                alt="Label Designer Preview"
                className="w-full h-auto rounded-lg shadow-lg border"
              />
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-designer-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Layers className="h-8 w-8 text-designer-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Design</h3>
                <p className="text-gray-600">
                  Design your custom labels using our intuitive drag-and-drop interface with text, barcodes, images, and more.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-designer-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-designer-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Import Data</h3>
                <p className="text-gray-600">
                  Import your data from CSV files or connect to your database for dynamic content in your labels.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-designer-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Printer className="h-8 w-8 text-designer-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Print</h3>
                <p className="text-gray-600">
                  Preview your labels and print them directly to your local or network printer, or export as PDF.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 bg-designer-dark text-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Ready-to-Use Templates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Shipping Label', img: 'https://via.placeholder.com/200?text=Shipping' },
                { name: 'Product Tag', img: 'https://via.placeholder.com/200?text=Product' },
                { name: 'Return Label', img: 'https://via.placeholder.com/200?text=Return' },
                { name: 'Address Label', img: 'https://via.placeholder.com/200?text=Address' }
              ].map((template, index) => (
                <div key={index} className="bg-white text-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <img
                    src={template.img}
                    alt={template.name}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-2">{template.name}</h3>
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link to={`/templates`}>Use Template</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-16">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Start Creating Professional Labels Today</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Join businesses that use PrintEasy to create professional, customized labels for all their needs.
            </p>
            <Button size="lg" asChild className="px-8">
              <Link to="/designer">Start Designing Now</Link>
            </Button>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <div className="mr-2 h-8 w-8 bg-designer-primary rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9 1a1 1 0 10-2 0v6a1 1 0 102 0V6zm-5 1a1 1 0 00-2 0v6a1 1 0 102 0V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="font-semibold text-lg">PrintEasy</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">© 2023 PrintEasy. All rights reserved.</p>
            </div>
            
            <div>
              <ul className="flex space-x-4">
                <li><a href="#" className="text-gray-600 hover:text-designer-primary">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-designer-primary">Features</a></li>
                <li><a href="#" className="text-gray-600 hover:text-designer-primary">Templates</a></li>
                <li><a href="#" className="text-gray-600 hover:text-designer-primary">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
