import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { LayoutDashboard, ShoppingCart, Truck, Package, Activity } from 'lucide-react';

export const AdminDashboard = () => {
  const metrics = [
    { title: 'Gross Revenue', value: '$12,480.00', icon: Activity, change: '+14.5% vs last week', color: 'primary' },
    { title: 'Total Dispatched Orders', value: '45 Active', icon: Truck, change: '10 pending approval', color: 'secondary' },
    { title: 'Total Catalog Products', value: '112 Items', icon: Package, change: '15 draft state', color: 'neutral' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Operations Console</h1>
        <p className="text-sm text-app-text-secondary">Global metrics, live dispatches, and catalog controls.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} hoverEffect>
              <CardBody className="flex items-center justify-between p-6">
                <div className="space-y-2">
                  <p className="text-xs text-app-text-secondary font-bold uppercase tracking-wider">{m.title}</p>
                  <p className="text-3xl font-extrabold text-app-text-primary">{m.value}</p>
                  <p className="text-xs text-secondary-600 dark:text-secondary-400 font-medium">{m.change}</p>
                </div>
                <div className="p-4 bg-app-bg-secondary border border-app-border rounded-2xl">
                  <Icon className="w-6 h-6 text-primary-500" />
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Grid of recent workflow updates */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-base">Recent Workflow Transactions</h3>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-app-bg-secondary border-b border-app-border text-app-text-secondary font-bold">
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Client</th>
                  <th className="px-6 py-3.5">Workflow Status</th>
                  <th className="px-6 py-3.5">Assigned Courier</th>
                  <th className="px-6 py-3.5">Total Bill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                <tr className="hover:bg-app-bg-secondary/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary-600">#ZEP-9902</td>
                  <td className="px-6 py-4 font-semibold">Jane Doe</td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" dot>Dispatched</Badge>
                  </td>
                  <td className="px-6 py-4">Alex Mercer</td>
                  <td className="px-6 py-4 font-bold">$299.00</td>
                </tr>
                <tr className="hover:bg-app-bg-secondary/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary-600">#ZEP-8104</td>
                  <td className="px-6 py-4 font-semibold">Mark R.</td>
                  <td className="px-6 py-4">
                    <Badge variant="success" dot>Delivered</Badge>
                  </td>
                  <td className="px-6 py-4">None (Self Pick)</td>
                  <td className="px-6 py-4 font-bold">$149.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
export default AdminDashboard;
