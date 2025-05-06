
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Printer } from "lucide-react";
import { useQuery } from '@tanstack/react-query';

interface Product {
  id: string;
  name: string;
  mrp: number;
  food_license?: string;
}

interface Branch {
  id: string;
  name: string;
}

const LabelsPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productId: '',
    branchId: '',
    weight: '',
    quantity: 1,
    mrp: 0,
    expiryDate: '',
    foodLicense: ''
  });
  const [loading, setLoading] = useState(false);

  // Generate today's date in YYYY-MM-DD format for the default expiry date
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  const defaultExpiryDate = threeMonthsLater.toISOString().split('T')[0];

  useEffect(() => {
    // Set default expiry date when component mounts
    setFormData(prev => ({ ...prev, expiryDate: defaultExpiryDate }));
  }, [defaultExpiryDate]);

  // Fetch products from Supabase
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        // In a real implementation, we would fetch from a products table
        // Example code (uncomment when you have a products table):
        /*
        const { data, error } = await supabase
          .from('products')
          .select('*');
        
        if (error) throw error;
        return data;
        */
        
        // For now, use mock data
        return [
          { id: 'p1', name: 'Organic Apples', mrp: 99.99, food_license: 'FL12345' },
          { id: 'p2', name: 'Fresh Bananas', mrp: 49.99, food_license: 'FL67890' },
          { id: 'p3', name: 'Premium Oranges', mrp: 79.99, food_license: 'FL54321' }
        ] as Product[];
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Fetch branches from Supabase
  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      try {
        // In a real implementation, we would fetch from a branches table
        // Example code (uncomment when you have a branches table):
        /*
        const { data, error } = await supabase
          .from('branches')
          .select('*');
        
        if (error) throw error;
        return data;
        */
        
        // For now, use mock data
        return [
          { id: 'b1', name: 'Main Store' },
          { id: 'b2', name: 'Downtown Branch' },
          { id: 'b3', name: 'Mall Outlet' }
        ] as Branch[];
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast({
          title: "Error",
          description: "Failed to fetch branches",
          variant: "destructive",
        });
        return [];
      }
    }
  });

  // Handle product selection to auto-fill MRP and food license
  const handleProductChange = (productId: string) => {
    const selectedProduct = products?.find(p => p.id === productId);
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        productId,
        mrp: selectedProduct.mrp,
        foodLicense: selectedProduct.food_license || ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.productId || !formData.branchId || !formData.weight || formData.quantity < 1) {
        toast({
          title: "Validation Error",
          description: "Please fill all required fields",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Generate batch number using current date
      const today = new Date();
      const batchNo = `BATCH${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
      
      // Create a new label batch record in Supabase
      const { data, error } = await supabase
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
          food_license: formData.foodLicense,
          printed_at: null
        })
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || "Failed to create label batch");
      }
      
      // Show success toast
      toast({
        title: "Success",
        description: `Label batch created with ${formData.quantity} labels`,
      });

      // Navigate to print preview page with the new label id
      navigate(`/labels/print/${data.id}`);
      
    } catch (error: any) {
      console.error("Error creating labels:", error);
      
      // For demonstration when database tables aren't set up yet
      // Create a mock label and store it in session storage
      if (error.message?.includes('relation "labels" does not exist') || 
          error.message?.includes('does not exist in schema')) {
          
        // Create a mock ID for demo purposes
        const mockId = 'mock-' + Math.random().toString(36).substring(2, 15);
        
        // Store label data in session storage
        const selectedProduct = products?.find(p => p.id === formData.productId);
        const selectedBranch = branches?.find(b => b.id === formData.branchId);
        
        const labelData = {
          id: mockId,
          batch_no: `BATCH20250501`,
          product_id: formData.productId,
          product_name: selectedProduct?.name || 'Unknown Product',
          branch_id: formData.branchId,
          branch_name: selectedBranch?.name || 'Unknown Branch',
          serial_start: 1,
          serial_end: formData.quantity,
          mrp: formData.mrp,
          weight: formData.weight,
          expiry_date: formData.expiryDate,
          food_license: formData.foodLicense,
          printed_at: null
        };
        
        sessionStorage.setItem(`label_${mockId}`, JSON.stringify(labelData));
        
        // Show mock success toast
        toast({
          title: "Demo Mode",
          description: "Created label batch in demo mode (no database connection)",
          variant: "default",
        });
        
        // Navigate to print preview page with the mock label id
        navigate(`/labels/print/${mockId}`);
        
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create label batch",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select 
                  value={formData.productId} 
                  onValueChange={handleProductChange}
                  disabled={productsLoading || loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select 
                  value={formData.branchId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: value }))}
                  disabled={branchesLoading || loading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight/Size</Label>
                <Input
                  id="weight"
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="e.g. 500g, 1kg, etc."
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mrp">MRP</Label>
                <Input
                  id="mrp"
                  type="number"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) => setFormData(prev => ({ ...prev, mrp: parseFloat(e.target.value) || 0 }))}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="foodLicense">Food License</Label>
                <Input
                  id="foodLicense"
                  type="text"
                  value={formData.foodLicense}
                  onChange={(e) => setFormData(prev => ({ ...prev, foodLicense: e.target.value }))}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => navigate('/labels/history')} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                Generate & Print Labels
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabelsPage;
