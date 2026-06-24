import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Package, Truck, Compass, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Orders = () => {
  const mockOrders = [
    { id: 'ZEP-9902', date: 'June 24, 2026', total: '$299.00', status: 'in-transit', statusLabel: 'In Transit' },
    { id: 'ZEP-8104', date: 'June 20, 2026', total: '$149.00', status: 'delivered', statusLabel: 'Delivered' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Orders</h1>
        <p className="text-sm text-app-text-secondary">Monitor your active shipments and purchase history.</p>
      </div>

      <div className="space-y-4">
        {mockOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="flex justify-between items-center bg-app-bg-secondary/40">
              <div className="space-y-1">
                <span className="text-xs text-app-text-secondary">Order ID</span>
                <p className="font-bold text-sm text-app-text-primary">{order.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={order.status === 'in-transit' ? 'secondary' : 'success'} dot>
                  {order.statusLabel}
                </Badge>
                <span className="text-xs text-app-text-secondary">{order.date}</span>
              </div>
            </CardHeader>
            <CardBody className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <p className="text-sm font-semibold">1x Premium Wireless Headphones</p>
                <p className="text-xs text-app-text-secondary mt-1">Payment Method: Credit Card</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-app-text-secondary">Total Amount Paid</span>
                <p className="font-extrabold text-base text-primary-600">{order.total}</p>
              </div>
            </CardBody>
            <CardFooter className="flex justify-end gap-3">
              {order.status === 'in-transit' && (
                <Link to={`/customer/track`}>
                  <Button size="sm" icon={Compass}>
                    Track Live GPS Location
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm">
                Invoice Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default Orders;
