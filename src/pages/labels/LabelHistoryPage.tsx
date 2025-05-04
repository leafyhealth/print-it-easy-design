
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Printer, Search, Calendar, List } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Label {
  id: string;
  batch_no: string;
  product_id: string;
  product_name?: string; // Will be populated after fetching
  branch_id: string;
  branch_name?: string; // Will be populated after fetching
  serial_start: number;
  serial_end: number;
  printed_at: string;
  expiry_date: string;
  mrp: number;
  weight: string;
}

interface Product {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
}

const LabelHistoryPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  // Fetch labels with filters
  const { data: labels, isLoading: labelsLoading, refetch } = useQuery({
    queryKey: ['labels', dateFilter, productFilter, branchFilter],
    queryFn: async () => {
      let query = supabase
        .from('labels')
        .select('*')
        .order('printed_at', { ascending: false });
      
      // Apply filters
      if (dateFilter) {
        query = query.eq('printed_at::date', dateFilter);
      }
      
      if (productFilter) {
        query = query.eq('product_id', productFilter);
      }
      
      if (branchFilter) {
        query = query.eq('branch_id', branchFilter);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching labels:", error);
        throw error;
      }
      
      return data || [];
    }
  });

  // Fetch products for filter
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      // Dummy products for demo, replace with actual API call
      return [
        { id: 'p1', name: 'Organic Apples' },
        { id: 'p2', name: 'Fresh Bananas' },
        { id: 'p3', name: 'Premium Oranges' }
      ] as Product[];
      // In a real app, use:
      // const { data, error } = await supabase.from('products').select('*');
      // if (error) throw error;
      // return data || [];
    }
  });

  // Fetch branches for filter
  const { data: branches, isLoading: branchesLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      // Dummy branches for demo, replace with actual API call
      return [
        { id: 'b1', name: 'Main Store' },
        { id: 'b2', name: 'Downtown Branch' },
        { id: 'b3', name: 'Mall Outlet' }
      ] as Branch[];
      // In a real app, use:
      // const { data, error } = await supabase.from('branches').select('*');
      // if (error) throw error;
      // return data || [];
    }
  });

  // Enrich labels with product and branch names
  const enrichedLabels = labels?.map(label => {
    const product = products?.find(p => p.id === label.product_id);
    const branch = branches?.find(b => b.id === label.branch_id);
    
    return {
      ...label,
      product_name: product?.name || 'Unknown Product',
      branch_name: branch?.name || 'Unknown Branch'
    };
  }).filter(label => {
    // Client-side search filter
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      label.batch_no.toLowerCase().includes(searchLower) ||
      label.product_name.toLowerCase().includes(searchLower) ||
      label.branch_name.toLowerCase().includes(searchLower) ||
      label.weight.toLowerCase().includes(searchLower)
    );
  });

  // Handle reprint
  const handleReprint = (labelId: string) => {
    navigate(`/labels/print/${labelId}`);
  };

  // Clear filters
  const clearFilters = () => {
    setDateFilter('');
    setProductFilter('');
    setBranchFilter('');
    setSearchTerm('');
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Label Print History</CardTitle>
            <CardDescription>View and reprint previously created label batches</CardDescription>
          </div>
          <Button onClick={() => navigate('/labels')} className="gap-2">
            <Printer className="h-4 w-4" /> Create New Labels
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search batch no, product or branch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="dateFilter" className="sr-only">Date Filter</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dateFilter"
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div>
                  <Select value={productFilter} onValueChange={setProductFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Product" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Products</SelectItem>
                      {products?.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Branches</SelectItem>
                      {branches?.map(branch => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={clearFilters}
                className="whitespace-nowrap"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch No</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Printed Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="text-right">MRP</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labelsLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : enrichedLabels && enrichedLabels.length > 0 ? (
                  enrichedLabels.map((label) => (
                    <TableRow key={label.id}>
                      <TableCell className="font-medium">{label.batch_no}</TableCell>
                      <TableCell>{label.product_name}</TableCell>
                      <TableCell>{label.branch_name}</TableCell>
                      <TableCell>{label.weight}</TableCell>
                      <TableCell className="text-right">{label.serial_end - label.serial_start + 1}</TableCell>
                      <TableCell>{format(new Date(label.printed_at), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(label.expiry_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-right">₹{label.mrp.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReprint(label.id)}
                          className="gap-1"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Reprint
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No label batches found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabelHistoryPage;
