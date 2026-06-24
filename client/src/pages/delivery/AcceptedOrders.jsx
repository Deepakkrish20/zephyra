import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { MapPin, CheckCircle, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AcceptedOrders = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Active Delivery Contracts</h1>
        <p className="text-sm text-app-text-secondary">Execute route logistics, coordinate live GPS, and check off completed drop-offs.</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader className="flex justify-between items-center bg-app-bg-secondary/40">
            <div>
              <span className="text-xs text-app-text-secondary">Contract ID</span>
              <p className="font-bold text-sm">#ZEP-9902</p>
            </div>
            <Badge variant="warning" dot>Pending Drop-off</Badge>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex gap-2 items-start text-sm">
              <MapPin className="w-4 h-4 text-danger-500 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-app-text-secondary uppercase">Ship To</p>
                <p className="font-semibold">Jane Doe</p>
                <p className="text-app-text-secondary text-xs">123 Main St, San Francisco</p>
              </div>
            </div>
            <div className="p-3 bg-primary-50 dark:bg-primary-500/10 border rounded-xl text-primary-700 dark:text-primary-400 text-xs">
              <strong>Task Alert:</strong> Make sure to enable GPS tracking location update events via your active console.
            </div>
          </CardBody>
          <CardFooter className="flex gap-3 justify-end">
            <Link to="/delivery/tracking">
              <Button size="sm" icon={Compass}>Open GPS Compass</Button>
            </Link>
            <Button size="sm" variant="success" icon={CheckCircle}>Confirm Delivery</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
export default AcceptedOrders;
