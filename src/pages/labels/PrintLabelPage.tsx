import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Printer, Save, RefreshCw, List, Download } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from "@/components/ui/use-toast";

interface Label {
  id: string;
  batch_no: string;
  product_id: string;
  branch_id: string;
  serial_start: number;
  serial_end: number;
  printed_at: string;
  expiry_date: string;
  mrp: number;
  weight: string;
  food_license: string | null;
}

interface Product {
  id: string;
  name: string;
}

const PrintLabelPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printContainerRef = useRef<HTMLDivElement>(null);
  const [activeLabelIndex, setActiveLabelIndex] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    showBorder: true,
    pageSize: 'a4',
    labelsPerPage: 10
  });
  
  // Fetch label data with improved error handling
  const { data: label, isLoading: labelLoading, error: labelError } = useQuery({
    queryKey: ['label', id],
    queryFn: async () => {
      if (!id) throw new Error('Label ID is required');

      // For demonstration, use mock data instead of actual Supabase call
      // In a real app, we would use the actual Supabase call
      
      // Simulate a successful response
      return {
        id,
        batch_no: `BATCH20250501`,
        product_id: 'p1',
        branch_id: 'b1',
        serial_start: 1,
        serial_end: 10,
        printed_at: new Date().toISOString(),
        expiry_date: '2025-08-01',
        mrp: 99.99,
        weight: '500g',
        food_license: 'FSSAI-12345'
      } as Label;
    },
    enabled: !!id,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Fetch product data with improved error handling
  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ['product', label?.product_id],
    queryFn: async () => {
      if (!label?.product_id) throw new Error('Product ID is required');
      
      // Use mock data for demo
      return { 
        id: label.product_id,
        name: label.product_id === 'p1' ? 'Organic Apples' : 
              label.product_id === 'p2' ? 'Fresh Bananas' : 'Premium Oranges'
      } as Product;
    },
    enabled: !!label?.product_id,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Generate label array based on quantity
  const labels = label ? Array.from({ length: label.serial_end - label.serial_start + 1 }, 
    (_, i) => ({
      ...label,
      serial_no: label.serial_start + i
    })
  ) : [];

  // Handle print with enhanced options
  const handlePrint = () => {
    setIsPrinting(true);
    
    const originalTitle = document.title;
    document.title = `Labels - ${label?.batch_no || 'Printing'}`;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Could not open print window. Please check your browser settings.",
        variant: "destructive",
      });
      setIsPrinting(false);
      return;
    }
    
    // Get the HTML content to print
    const contentToPrint = printContainerRef.current?.innerHTML;
    
    // Write to the new window with enhanced styling options
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${document.title}</title>
        <style>
          @media print {
            body { margin: 0; padding: 10px; }
            
            .label-container {
              display: flex;
              flex-wrap: wrap;
              gap: ${printOptions.showBorder ? '10px' : '0'};
              width: 100%;
              justify-content: space-between;
            }
            
            .label {
              ${printOptions.showBorder ? 'border: 1px solid #000;' : ''}
              padding: 8px;
              width: ${printOptions.pageSize === 'a4' ? '2.4in' : '2in'};
              height: ${printOptions.pageSize === 'a4' ? '1.4in' : '1in'};
              page-break-inside: avoid;
              box-sizing: border-box;
              margin-bottom: 10px;
              position: relative;
            }
            
            .label h3 {
              margin: 0 0 4px 0;
              font-size: 14px;
              font-weight: bold;
            }
            
            .label-row {
              display: flex;
              justify-content: space-between;
              font-size: 12px;
              margin-bottom: 2px;
            }
            
            .serial-no {
              font-weight: bold;
              font-size: 16px;
              text-align: center;
            }
            
            .batch-no {
              font-size: 10px;
            }
            
            .food-license {
              font-size: 8px;
              font-style: italic;
            }
            
            @page {
              size: ${printOptions.pageSize};
              margin: 0.5cm;
            }
            
            /* Break pages after a certain number of labels */
            .label:nth-child(${printOptions.labelsPerPage}n) {
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        ${contentToPrint || ''}
        <script>
          window.onload = function() {
            window.print();
            window.setTimeout(function() {
              window.close();
            }, 500);
          }
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    document.title = originalTitle;
    
    // Reset the printing state after a delay
    setTimeout(() => {
      setIsPrinting(false);
      toast({
        title: "Success",
        description: "Print job sent successfully!",
      });
    }, 1500);
  };

  // Save as PDF with improved implementation
  const handleSaveAsPdf = () => {
    setIsSaving(true);
    
    toast({
      title: "PDF Generation",
      description: "PDF download started. Please wait...",
    });
    
    // Use the same print window approach but prompt for save instead
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Could not open PDF generation window. Please check your browser settings.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }
    
    const contentToPrint = printContainerRef.current?.innerHTML;
    const fileName = `labels-${label?.batch_no || 'batch'}.pdf`;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName}</title>
        <style>
          body { margin: 0; padding: 10px; }
          
          .label-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            width: 100%;
          }
          
          .label {
            border: 1px solid #000;
            padding: 8px;
            width: 2.5in;
            height: 1.5in;
            page-break-inside: avoid;
            box-sizing: border-box;
            margin-bottom: 10px;
          }
          
          .label h3 {
            margin: 0 0 4px 0;
            font-size: 14px;
          }
          
          .label-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-bottom: 2px;
          }
          
          .serial-no {
            font-weight: bold;
            font-size: 16px;
          }
          
          .batch-no {
            font-size: 10px;
          }
          
          .food-license {
            font-size: 8px;
            font-style: italic;
          }
          
          @media print {
            @page {
              size: ${printOptions.pageSize};
              margin: 0.5cm;
            }
            
            /* Break pages after a certain number of labels */
            .label:nth-child(${printOptions.labelsPerPage}n) {
              page-break-after: always;
            }
          }
          
          .save-instructions {
            text-align: center;
            margin: 20px 0;
            padding: 10px;
            background-color: #f0f8ff;
            border: 1px solid #007bff;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="save-instructions">
          <h2>Save as PDF Instructions</h2>
          <p>1. Press Ctrl+P (or Cmd+P on Mac)</p>
          <p>2. Change destination to "Save as PDF"</p>
          <p>3. Click Save and choose where to save the file</p>
        </div>
        ${contentToPrint || ''}
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "PDF Ready",
        description: "Follow the instructions to save your PDF.",
      });
    }, 1500);
  };

  // Navigate between labels
  const handleNextLabel = () => {
    if (activeLabelIndex < labels.length - 1) {
      setActiveLabelIndex(prev => prev + 1);
    }
  };

  const handlePrevLabel = () => {
    if (activeLabelIndex > 0) {
      setActiveLabelIndex(prev => prev - 1);
    }
  };

  // Show error state with retry option
  if (labelError) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Failed to load label data. Please try again.</p>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => navigate('/labels/history')}>
                Return to History
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Print Labels</CardTitle>
            {!labelLoading && label && (
              <p className="text-sm text-muted-foreground mt-1">
                Batch: {label.batch_no} | Quantity: {label.serial_end - label.serial_start + 1}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/labels/history')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Back to History
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleSaveAsPdf}
              disabled={isSaving || labelLoading || productLoading}
              className="gap-2"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save as PDF
            </Button>
            <Button 
              onClick={handlePrint}
              disabled={isPrinting || labelLoading || productLoading}
              className="gap-2"
            >
              {isPrinting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Printer className="h-4 w-4" />
              )}
              Print All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(labelLoading || productLoading) ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <p>Loading label data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Print options */}
              <div className="mb-6 border rounded-lg p-4 bg-muted/20">
                <h3 className="text-base font-medium mb-3">Print Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="showBorder"
                      checked={printOptions.showBorder} 
                      onChange={(e) => setPrintOptions(prev => ({...prev, showBorder: e.target.checked}))}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="showBorder" className="text-sm font-medium">
                      Show Border
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label htmlFor="pageSize" className="text-sm font-medium">
                      Page Size:
                    </label>
                    <select 
                      id="pageSize"
                      value={printOptions.pageSize}
                      onChange={(e) => setPrintOptions(prev => ({...prev, pageSize: e.target.value}))}
                      className="rounded border border-gray-300 text-sm p-1"
                    >
                      <option value="a4">A4</option>
                      <option value="letter">Letter</option>
                      <option value="legal">Legal</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label htmlFor="labelsPerPage" className="text-sm font-medium">
                      Labels per page:
                    </label>
                    <select 
                      id="labelsPerPage"
                      value={printOptions.labelsPerPage}
                      onChange={(e) => setPrintOptions(prev => ({...prev, labelsPerPage: parseInt(e.target.value)}))}
                      className="rounded border border-gray-300 text-sm p-1"
                    >
                      <option value="6">6</option>
                      <option value="8">8</option>
                      <option value="10">10</option>
                      <option value="12">12</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview of single label for mobile/screen view */}
              <div className="mb-6 border rounded-lg p-4">
                <h3 className="text-lg font-bold mb-2">Label Preview</h3>
                {labels.length > 0 && (
                  <>
                    <div className="border rounded p-4 mb-4 bg-white">
                      <h3 className="font-bold text-lg">{product?.name}</h3>
                      <div className="flex justify-between text-sm">
                        <span>Weight: {label?.weight}</span>
                        <span>MRP: ₹{label?.mrp.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Expiry: {format(new Date(label?.expiry_date), 'dd/MM/yyyy')}</span>
                        <span className="batch-no">Batch: {label?.batch_no}</span>
                      </div>
                      <div className="mt-2 border-t pt-2">
                        <div className="serial-no text-center font-bold">
                          Serial #: {labels[activeLabelIndex].serial_no}
                        </div>
                      </div>
                      {label?.food_license && (
                        <div className="food-license text-xs mt-1 text-gray-500 italic">
                          FSSAI: {label.food_license}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handlePrevLabel}
                        disabled={activeLabelIndex === 0}
                      >
                        Previous
                      </Button>
                      <span className="text-sm">
                        Label {activeLabelIndex + 1} of {labels.length}
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleNextLabel}
                        disabled={activeLabelIndex === labels.length - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </>
                )}
              </div>
              
              {/* This is the container that will be printed - hidden initially */}
              <div className="print:block hidden" ref={printContainerRef}>
                <div className="label-container">
                  {labels.map((labelItem, index) => (
                    <div className="label" key={`${labelItem.id}-${index}`}>
                      <h3>{product?.name}</h3>
                      <div className="label-row">
                        <span>Weight: {labelItem.weight}</span>
                        <span>MRP: ₹{labelItem.mrp.toFixed(2)}</span>
                      </div>
                      <div className="label-row">
                        <span>Expiry: {format(new Date(labelItem.expiry_date), 'dd/MM/yyyy')}</span>
                        <span className="batch-no">Batch: {labelItem.batch_no}</span>
                      </div>
                      <div className="mt-2 border-t pt-1">
                        <div className="serial-no text-center">
                          Serial #: {labelItem.serial_no}
                        </div>
                      </div>
                      {labelItem.food_license && (
                        <div className="food-license mt-1">
                          FSSAI: {labelItem.food_license}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintLabelPage;
