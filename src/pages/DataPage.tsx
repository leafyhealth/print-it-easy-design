
import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Upload, Plus, File } from 'lucide-react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DataPage = () => {
  // Mock data
  const dataSources = [
    { id: 1, name: 'Products_April.csv', rows: 120, lastUpdated: '2023-04-20', fields: ['SKU', 'Name', 'Price', 'Barcode'] },
    { id: 2, name: 'Shipping_Labels.xlsx', rows: 75, lastUpdated: '2023-04-18', fields: ['OrderID', 'Customer', 'Address', 'Tracking'] }
  ];
  
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 overflow-auto p-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Data Sources</h1>
            <div className="flex gap-2">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Data Source
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border overflow-hidden mb-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">File Name</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <File className="h-4 w-4 mr-2 text-gray-500" />
                        {source.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {source.fields.map((field, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-xs rounded">
                            {field}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{source.rows}</TableCell>
                    <TableCell>{source.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-designer-primary">Use</Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {dataSources.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="text-gray-500">
                        <p>No data sources found</p>
                        <p className="text-sm mt-1">Import a CSV file or connect to a database</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-medium mb-4">Connect Data Source</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-designer-primary/10 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-designer-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="font-medium">Upload CSV/Excel</p>
                <p className="text-sm text-gray-500 mt-1 text-center">Import data from file</p>
              </Button>
              
              <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-designer-primary/10 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-designer-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                    <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                    <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                  </svg>
                </div>
                <p className="font-medium">Database</p>
                <p className="text-sm text-gray-500 mt-1 text-center">Connect to PostgreSQL</p>
              </Button>
              
              <Button variant="outline" className="h-auto py-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-designer-primary/10 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-designer-primary" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="font-medium">Manual Entry</p>
                <p className="text-sm text-gray-500 mt-1 text-center">Create data manually</p>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DataPage;
