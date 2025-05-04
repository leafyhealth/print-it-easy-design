
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, RefreshCw, Calendar, List } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface ReportSummary {
  totalPrinted: number;
  totalSold: number;
  totalReturned: number;
  availableStock: number;
}

interface ReportData {
  batch_no: string;
  product_name: string;
  branch_name: string;
  printed: number;
  sold: number;
  returned: number;
  available: number;
}

interface Branch {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

const LabelReportsPage = () => {
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [productFilter, setProductFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  
  // Fetch report data
  const { data: reportData, isLoading } = useQuery({
    queryKey: ['label-reports', dateRange, productFilter, branchFilter],
    queryFn: async () => {
      // In a real app, this would be a Supabase query or API call
      // that joins labels with label_tracking to get the summary
      
      // Dummy data for demonstration
      const mockData: ReportData[] = [
        {
          batch_no: 'BATCH20250501',
          product_name: 'Organic Apples',
          branch_name: 'Main Store',
          printed: 100,
          sold: 65,
          returned: 5,
          available: 30
        },
        {
          batch_no: 'BATCH20250429',
          product_name: 'Fresh Bananas',
          branch_name: 'Downtown Branch',
          printed: 75,
          sold: 70,
          returned: 2,
          available: 3
        },
        {
          batch_no: 'BATCH20250428',
          product_name: 'Premium Oranges',
          branch_name: 'Mall Outlet',
          printed: 50,
          sold: 25,
          returned: 0,
          available: 25
        },
        {
          batch_no: 'BATCH20250427',
          product_name: 'Organic Apples',
          branch_name: 'Downtown Branch',
          printed: 80,
          sold: 78,
          returned: 2,
          available: 0
        }
      ];
      
      // Apply filters
      let filteredData = [...mockData];
      
      if (productFilter) {
        filteredData = filteredData.filter(item => {
          // This would match product IDs in a real app
          return item.product_name.toLowerCase().includes(productFilter.toLowerCase());
        });
      }
      
      if (branchFilter) {
        filteredData = filteredData.filter(item => {
          // This would match branch IDs in a real app
          return item.branch_name.toLowerCase().includes(branchFilter.toLowerCase());
        });
      }
      
      // Date filtering would be done in a real app
      
      return filteredData;
    }
  });
  
  // Calculate summary data
  const summary: ReportSummary = reportData ? reportData.reduce(
    (acc, curr) => {
      return {
        totalPrinted: acc.totalPrinted + curr.printed,
        totalSold: acc.totalSold + curr.sold,
        totalReturned: acc.totalReturned + curr.returned,
        availableStock: acc.availableStock + curr.available
      };
    },
    { totalPrinted: 0, totalSold: 0, totalReturned: 0, availableStock: 0 }
  ) : { totalPrinted: 0, totalSold: 0, totalReturned: 0, availableStock: 0 };

  // Fetch products for filter
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      // Dummy products for demo, replace with actual API call
      return [
        { id: 'p1', name: 'Organic Apples' },
        { id: 'p2', name: 'Fresh Bananas' },
        { id: 'p3', name: 'Premium Oranges' }
      ] as Product[];
    }
  });

  // Fetch branches for filter
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      // Dummy branches for demo, replace with actual API call
      return [
        { id: 'b1', name: 'Main Store' },
        { id: 'b2', name: 'Downtown Branch' },
        { id: 'b3', name: 'Mall Outlet' }
      ] as Branch[];
    }
  });

  // Clear filters
  const clearFilters = () => {
    setDateRange({
      start: '',
      end: ''
    });
    setProductFilter('');
    setBranchFilter('');
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Label Reports
          </CardTitle>
          <CardDescription>
            Track label usage, sales, and returns across your inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="start-date"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="end-date"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                <div className="space-y-2">
                  <Label htmlFor="product-filter">Product</Label>
                  <Select value={productFilter} onValueChange={setProductFilter}>
                    <SelectTrigger id="product-filter">
                      <SelectValue placeholder="All Products" />
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
                
                <div className="space-y-2">
                  <Label htmlFor="branch-filter">Branch</Label>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger id="branch-filter">
                      <SelectValue placeholder="All Branches" />
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
              
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription>Total Printed</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-bold">{summary.totalPrinted}</div>
                <p className="text-xs text-muted-foreground">labels</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription>Total Sold</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-bold">{summary.totalSold}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.totalPrinted > 0 ? 
                    `${Math.round((summary.totalSold / summary.totalPrinted) * 100)}% of printed` : 
                    '0% of printed'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription>Total Returned</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-bold">{summary.totalReturned}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.totalPrinted > 0 ? 
                    `${Math.round((summary.totalReturned / summary.totalPrinted) * 100)}% of printed` : 
                    '0% of printed'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardDescription>Available Stock</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <div className="text-2xl font-bold">{summary.availableStock}</div>
                <p className="text-xs text-muted-foreground">
                  {summary.totalPrinted > 0 ? 
                    `${Math.round((summary.availableStock / summary.totalPrinted) * 100)}% of printed` : 
                    '0% of printed'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Report Table */}
          <Card>
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-lg">Detailed Report</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Batch No</th>
                      <th className="text-left p-4">Product</th>
                      <th className="text-left p-4">Branch</th>
                      <th className="text-right p-4">Printed</th>
                      <th className="text-right p-4">Sold</th>
                      <th className="text-right p-4">Returned</th>
                      <th className="text-right p-4">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="text-center p-8">
                          <div className="flex justify-center items-center">
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            Loading report data...
                          </div>
                        </td>
                      </tr>
                    ) : reportData && reportData.length > 0 ? (
                      reportData.map((item, index) => (
                        <tr key={`${item.batch_no}-${index}`} className="border-b hover:bg-muted/50">
                          <td className="p-4">{item.batch_no}</td>
                          <td className="p-4">{item.product_name}</td>
                          <td className="p-4">{item.branch_name}</td>
                          <td className="text-right p-4">{item.printed}</td>
                          <td className="text-right p-4">{item.sold}</td>
                          <td className="text-right p-4">{item.returned}</td>
                          <td className="text-right p-4">{item.available}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center p-8">
                          No report data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
        </CardContent>
      </Card>
    </div>
  );
};

export default LabelReportsPage;
