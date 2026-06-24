import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Check, ClipboardList, ShieldAlert, Compass } from 'lucide-react';

export const OrderManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order Workflow Dispatch</h1>
        <p className="text-sm text-app-text-secondary">Approve customer orders, dispatch active packages, and monitor GPS routes.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-base">Incoming Purchase Logs</h3>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-app-bg-secondary border-b border-app-border text-app-text-secondary font-bold">
                  <th className="px-6 py-3.5">Order</th>
                  <th className="px-6 py-3.5">Address</th>
                  <th className="px-6 py-3.5">Flow State</th>
                  <th className="px-6 py-3.5 text-right">Workflow Override Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                <tr className="hover:bg-app-bg-secondary/40 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-app-text-primary">#ZEP-9902</p>
                    <span className="text-xs text-app-text-secondary">$299.00 • 1 item</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold">123 Main St, San Francisco</td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" dot>Pending Agent Acceptance</Badge>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <Button size="sm" variant="success" icon={Check}>Approve Order</Button>
                    <Button size="sm" variant="outline" icon={Compass}>Inspect GPS</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
export default OrderManagement;
