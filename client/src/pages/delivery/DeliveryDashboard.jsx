import React from 'react';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Activity, Compass, Award, ClipboardCheck } from 'lucide-react';

export const DeliveryDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Driver Console</h1>
        <p className="text-sm text-app-text-secondary">Accept, track, and complete live customer shipments.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverEffect>
          <CardBody className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs text-app-text-secondary font-bold uppercase tracking-wider">Shift Complete</p>
              <p className="text-3xl font-extrabold text-app-text-primary">12 Orders</p>
              <p className="text-xs text-success-600 font-semibold">100% on-time rate</p>
            </div>
            <div className="p-4 bg-app-bg-secondary border rounded-xl">
              <ClipboardCheck className="w-6 h-6 text-secondary-500" />
            </div>
          </CardBody>
        </Card>

        <Card hoverEffect>
          <CardBody className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs text-app-text-secondary font-bold uppercase tracking-wider">Active Earnings</p>
              <p className="text-3xl font-extrabold text-app-text-primary">$180.50</p>
              <p className="text-xs text-secondary-600 dark:text-secondary-400">+$24.00 tips</p>
            </div>
            <div className="p-4 bg-app-bg-secondary border rounded-xl">
              <Activity className="w-6 h-6 text-primary-500" />
            </div>
          </CardBody>
        </Card>

        <Card hoverEffect>
          <CardBody className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs text-app-text-secondary font-bold uppercase tracking-wider">Driver Rating</p>
              <p className="text-3xl font-extrabold text-app-text-primary">4.92 / 5</p>
              <p className="text-xs text-yellow-600 font-semibold">Top Tier Agent</p>
            </div>
            <div className="p-4 bg-app-bg-secondary border rounded-xl">
              <Award className="w-6 h-6 text-yellow-500" />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
export default DeliveryDashboard;
