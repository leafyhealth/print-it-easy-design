
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Label {
  id: string;
  batch_no: string;
  product_id: string;
  serial_start: number;
  serial_end: number;
  printed_at: string;
  expiry_date: string;
}

const LabelHistoryPage = () => {
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .order('printed_at', { ascending: false });

    if (!error && data) {
      setLabels(data);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Label History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">Batch No</th>
                  <th className="text-left p-2">Product ID</th>
                  <th className="text-left p-2">Quantity</th>
                  <th className="text-left p-2">Printed Date</th>
                  <th className="text-left p-2">Expiry Date</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {labels.map((label) => (
                  <tr key={label.id} className="border-t">
                    <td className="p-2">{label.batch_no}</td>
                    <td className="p-2">{label.product_id}</td>
                    <td className="p-2">{label.serial_end - label.serial_start + 1}</td>
                    <td className="p-2">{new Date(label.printed_at).toLocaleDateString()}</td>
                    <td className="p-2">{new Date(label.expiry_date).toLocaleDateString()}</td>
                    <td className="p-2">
                      <Button variant="outline" size="sm">
                        Reprint
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabelHistoryPage;
