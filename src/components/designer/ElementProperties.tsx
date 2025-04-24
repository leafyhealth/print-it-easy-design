
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ElementProperties = () => {
  // In a real app, these would be driven by your state management based on selected element
  const selectedType = 'text'; // Could be 'text', 'barcode', 'image', etc.
  
  return (
    <div className="space-y-4">
      {selectedType === 'text' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="content">Text Content</Label>
            <Input id="content" defaultValue="Sample Product" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="font-family">Font</Label>
            <select id="font-family" className="w-full px-3 py-2 bg-background border rounded-md">
              <option>Arial</option>
              <option>Times New Roman</option>
              <option>Courier New</option>
              <option>Verdana</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="font-size">Font Size</Label>
              <span className="text-sm">12pt</span>
            </div>
            <Slider
              id="font-size"
              defaultValue={[12]}
              max={72}
              min={6}
              step={1}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="x-pos">X Position</Label>
              <Input id="x-pos" defaultValue="10" />
            </div>
            <div>
              <Label htmlFor="y-pos">Y Position</Label>
              <Input id="y-pos" defaultValue="10" />
            </div>
            <div>
              <Label htmlFor="width">Width</Label>
              <Input id="width" defaultValue="100" />
            </div>
            <div>
              <Label htmlFor="height">Height</Label>
              <Input id="height" defaultValue="20" />
            </div>
          </div>
          
          <Tabs defaultValue="style">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            <TabsContent value="style" className="space-y-3 pt-2">
              <div className="grid grid-cols-4 gap-2">
                <button className="p-2 border rounded text-center hover:bg-gray-50">
                  <span className="font-bold">B</span>
                </button>
                <button className="p-2 border rounded text-center hover:bg-gray-50">
                  <span className="italic">I</span>
                </button>
                <button className="p-2 border rounded text-center hover:bg-gray-50">
                  <span className="underline">U</span>
                </button>
                <button className="p-2 border rounded text-center hover:bg-gray-50">
                  <span>A</span>
                </button>
              </div>
              
              <div>
                <Label>Color</Label>
                <div className="flex mt-1 space-x-2">
                  <div className="w-8 h-8 rounded-full bg-black border cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-red-600 border cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-blue-600 border cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-green-600 border cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-designer-primary border cursor-pointer"></div>
                  <button className="w-8 h-8 rounded-full bg-gray-100 border flex items-center justify-center">
                    +
                  </button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="data" className="pt-2">
              <div className="space-y-2">
                <Label>Data Source</Label>
                <select className="w-full px-3 py-2 bg-background border rounded-md">
                  <option>Static Text</option>
                  <option>Database Field</option>
                  <option>Formula</option>
                </select>
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="pt-2">
              <div className="space-y-2">
                <div className="flex items-center">
                  <input type="checkbox" id="rotation-enabled" className="mr-2" />
                  <Label htmlFor="rotation-enabled">Enable Rotation</Label>
                </div>
                <div className="flex justify-between">
                  <Label htmlFor="rotation">Rotation</Label>
                  <span className="text-sm">0°</span>
                </div>
                <Slider
                  id="rotation"
                  defaultValue={[0]}
                  max={360}
                  min={0}
                  step={1}
                  disabled={true}
                />
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
      
      {!selectedType && (
        <div className="text-center py-8 text-gray-500">
          Select an element to edit its properties
        </div>
      )}
    </div>
  );
};

export default ElementProperties;
