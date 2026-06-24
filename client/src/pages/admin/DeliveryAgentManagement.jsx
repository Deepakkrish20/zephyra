import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Truck } from 'lucide-react';

export const DeliveryAgentManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Delivery Agent Dispatch Roster</h1>
        <p className="text-sm text-app-text-secondary">Verify and monitor active dispatch agent locations.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-secondary-600" />
            <h3 className="font-bold text-base">Courier Registry</h3>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-app-bg-secondary border-b border-app-border text-app-text-secondary font-bold">
                <th className="px-6 py-3.5">Agent Tag</th>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Duty Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              <tr className="hover:bg-app-bg-secondary/40 transition-colors">
                <td className="px-6 py-4 font-bold text-primary-600">#ZEP-DRV-09</td>
                <td className="px-6 py-4 font-semibold">Alex Mercer</td>
                <td className="px-6 py-4">
                  <Badge variant="secondary" dot>Active (On Duty)</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
};
export default DeliveryAgentManagement;
