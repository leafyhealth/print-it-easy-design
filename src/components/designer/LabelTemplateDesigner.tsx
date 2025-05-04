
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define known placeholders that will be available for all labels
const PLACEHOLDERS = [
  { key: 'product_name', label: 'Product Name', example: 'Organic Apples' },
  { key: 'weight', label: 'Weight/Size', example: '500g' },
  { key: 'mrp', label: 'MRP', example: '₹99.99' },
  { key: 'batch_no', label: 'Batch Number', example: 'BATCH20250501' },
  { key: 'expiry_date', label: 'Expiry Date', example: '01/08/2025' },
  { key: 'serial_no', label: 'Serial Number', example: '001' },
  { key: 'food_license', label: 'Food License', example: 'FSSAI-12345' }
];

interface LabelTemplateDesignerProps {
  onAddPlaceholder?: (placeholder: string) => void;
  onInsertTemplate?: (template: string) => void;
}

const LabelTemplateDesigner: React.FC<LabelTemplateDesignerProps> = ({
  onAddPlaceholder,
  onInsertTemplate
}) => {
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');

  // Templates for different types of labels
  const labelTemplates = {
    standard: `
      <div class="label">
        <h3>{{product_name}}</h3>
        <div class="info-row">
          <span>Weight: {{weight}}</span>
          <span>MRP: {{mrp}}</span>
        </div>
        <div class="info-row">
          <span>Batch: {{batch_no}}</span>
          <span>Exp: {{expiry_date}}</span>
        </div>
        <div class="serial-number">
          {{serial_no}}
        </div>
        <div class="license">{{food_license}}</div>
      </div>
    `,
    compact: `
      <div class="label">
        <h4>{{product_name}} - {{weight}}</h4>
        <div>MRP: {{mrp}} | Exp: {{expiry_date}}</div>
        <div>Batch: {{batch_no}} | SN: {{serial_no}}</div>
        <small>{{food_license}}</small>
      </div>
    `,
    qrcode: `
      <div class="label">
        <h4>{{product_name}}</h4>
        <div class="qr-code">{{qr_code}}</div>
        <div>{{weight}} | MRP: {{mrp}}</div>
        <div>Batch: {{batch_no}} ({{serial_no}})</div>
      </div>
    `
  };

  // Handle inserting a placeholder
  const handleAddPlaceholder = (placeholder: string) => {
    if (onAddPlaceholder) {
      onAddPlaceholder(`{{${placeholder}}}`);
    }
    setSelectedPlaceholder('');
  };

  // Handle inserting a template
  const handleInsertTemplate = () => {
    if (onInsertTemplate && selectedTemplate in labelTemplates) {
      onInsertTemplate(labelTemplates[selectedTemplate as keyof typeof labelTemplates]);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Label Template Designer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Available Placeholders</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add these dynamic placeholders to your label template. They will be replaced with actual values at print time.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {PLACEHOLDERS.map(placeholder => (
              <Button 
                key={placeholder.key}
                variant="outline" 
                size="sm"
                className="justify-start text-left"
                title={`Example: ${placeholder.example}`}
                onClick={() => handleAddPlaceholder(placeholder.key)}
              >
                {placeholder.label}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-2">Template Library</h3>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="template-select">Choose a pre-designed template:</Label>
              <div className="flex gap-2 mt-2">
                <select 
                  id="template-select"
                  className="flex-1 border rounded p-2"
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                >
                  <option value="standard">Standard Label</option>
                  <option value="compact">Compact Label</option>
                  <option value="qrcode">QR Code Label</option>
                </select>
                <Button onClick={handleInsertTemplate}>
                  Insert Template
                </Button>
              </div>
            </div>
            
            <div className="mt-2 p-4 border rounded-md bg-muted/20">
              <h4 className="font-medium mb-2">Template Preview:</h4>
              <div className="bg-white p-2 border rounded min-h-[100px] text-xs overflow-auto">
                <pre className="whitespace-pre-wrap">
                  {selectedTemplate in labelTemplates
                    ? labelTemplates[selectedTemplate as keyof typeof labelTemplates]
                    : 'Select a template to preview'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LabelTemplateDesigner;
