
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, ArrowRight } from "lucide-react";
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Label {
  id: string;
  batch_no: string;
  product_id: string;
  branch_id: string;
  serial_start: number;
  serial_end: number;
  mrp: number;
  weight: string;
  printed_at: string;
  expiry_date: string;
  product_name?: string;
}

const LabelHistoryPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    branch: '',
    product: '',
    date: '',
  });

  // Fetch label history
  const { data: labels, isLoading } = useQuery({
    queryKey: ['labels', 'history', filters],
    queryFn: async () => {
      // In a real app, use Supabase
      // const { data, error } = await supabase
      //   .from('labels')
      //   .select('*, products(name)')
      //   .order('printed_at', { ascending: false });
      
      // if (error) throw error;
      // return data.map(item => ({
      //   ...item,
      //   product_name: item.products?.name
      // }));

      // Demo data for now
      return [
        {
          id: '1',
          batch_no: 'BATCH20250501',
          product_id: 'p1',
          branch_id: 'b1',
          serial_start: 1,
          serial_end: 50,
          mrp: 99.99,
          weight: '500g',
          printed_at: new Date().toISOString(),
          expiry_date: '2025-08-01',
          product_name: 'Organic Apples'
        },
        {
          id: '2',
          batch_no: 'BATCH20250502',
          product_id: 'p2',
          branch_id: 'b2',
          serial_start: 1,
          serial_end: 100,
          mrp: 49.99,
          weight: '1kg',
          printed_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          expiry_date: '2025-07-15',
          product_name: 'Fresh Bananas'
        },
        {
          id: '3',
          batch_no: 'BATCH20250503',
          product_id: 'p3',
          branch_id: 'b1',
          serial_start: 1,
          serial_end: 30,
          mrp: 79.99,
          weight: '250g',
          printed_at: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
          expiry_date: '2025-06-30',
          product_name: 'Premium Oranges'
        }
      ];
    }
  });

  const handlePrintLabel = (labelId: string) => {
    navigate(`/labels/print/${labelId}`);
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Label History</CardTitle>
          <Button onClick={() => navigate('/labels')} className="gap-2">
            <Printer className="h-4 w-4" />
            Print New Labels
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <Select 
                value={filters.branch} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, branch: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Branches</SelectItem>
                  <SelectItem value="b1">Main Store</SelectItem>
                  <SelectItem value="b2">Downtown Branch</SelectItem>
                  <SelectItem value="b3">Mall Outlet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select 
                value={filters.product} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, product: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Products</SelectItem>
                  <SelectItem value="p1">Organic Apples</SelectItem>
                  <SelectItem value="p2">Fresh Bananas</SelectItem>
                  <SelectItem value="p3">Premium Oranges</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input 
                type="date" 
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                placeholder="Filter by Date"
              />
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch No</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>MRP</TableHead>
                  <TableHead>Printed On</TableHead>
                  <TableHead>Expires On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">Loading...</TableCell>
                  </TableRow>
                ) : labels && labels.length > 0 ? (
                  labels.map((label) => (
                    <TableRow key={label.id}>
                      <TableCell className="font-medium">{label.batch_no}</TableCell>
                      <TableCell>{label.product_name}</TableCell>
                      <TableCell>{label.serial_end - label.serial_start + 1}</TableCell>
                      <TableCell>{label.weight}</TableCell>
                      <TableCell>₹{label.mrp.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(label.printed_at), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{format(new Date(label.expiry_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePrintLabel(label.id)}
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
                    <TableCell colSpan={8} className="text-center py-4">No label history found</TableCell>
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
