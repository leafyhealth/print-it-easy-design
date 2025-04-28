
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const LabelsPage = () => {
  const [formData, setFormData] = useState({
    productId: '',
    branchId: '',
    weight: '',
    quantity: 1,
    mrp: 0,
    expiryDate: '',
    foodLicense: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Generate batch number using current date
      const today = new Date();
      const batchNo = `BATCH${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      
      const { error } = await supabase
        .from('labels')
        .insert({
          product_id: formData.productId,
          branch_id: formData.branchId,
          batch_no: batchNo,
          serial_start: 1,
          serial_end: formData.quantity,
          mrp: formData.mrp,
          weight: formData.weight,
          expiry_date: formData.expiryDate,
          food_license: formData.foodLicense
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Label batch created successfully",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create label batch",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create Label Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Product ID</label>
              <Input
                type="text"
                value={formData.productId}
                onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Branch ID</label>
              <Input
                type="text"
                value={formData.branchId}
                onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight</label>
              <Input
                type="text"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">MRP</label>
              <Input
                type="number"
                step="0.01"
                value={formData.mrp}
                onChange={(e) => setFormData(prev => ({ ...prev, mrp: parseFloat(e.target.value) }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Expiry Date</label>
              <Input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Food License</label>
              <Input
                type="text"
                value={formData.foodLicense}
                onChange={(e) => setFormData(prev => ({ ...prev, foodLicense: e.target.value }))}
              />
            </div>
            <Button type="submit">Create Label Batch</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabelsPage;
