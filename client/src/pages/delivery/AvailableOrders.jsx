import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { MapPin, Navigation, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AvailableOrders = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Available Delivery Job Offers</h1>
        <p className="text-sm text-app-text-secondary">First-come first-served route dispatches. Accept tasks below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hoverEffect className="flex flex-col justify-between">
          <CardHeader className="flex justify-between items-center">
            <div>
              <span className="text-xs text-app-text-secondary">Order Reference</span>
              <p className="font-bold text-sm">#ZEP-9902</p>
            </div>
            <Badge variant="secondary" dot>Available Now</Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex gap-2 items-start text-sm">
              <MapPin className="w-4 h-4 text-danger-500 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-app-text-secondary uppercase">Delivery Address</p>
                <p>123 Main St, San Francisco</p>
              </div>
            </div>
            <div className="flex gap-2 items-start text-sm">
              <DollarSign className="w-4 h-4 text-success-500 mt-0.5" />
              <div>
                <p className="font-bold text-xs text-app-text-secondary uppercase">Payout Rate</p>
                <p className="font-bold text-success-600">$12.50 base + tips</p>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <Link to="/delivery/accepted-orders" className="w-full">
              <Button className="w-full" icon={Navigation}>
                Accept Delivery Job
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
export default AvailableOrders;
