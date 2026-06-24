import React from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Checkout = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Checkout Order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipping Form */}
        <Card>
          <CardHeader>
            <h3 className="font-bold text-base">Delivery Address</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input label="Full Name" placeholder="Jane Doe" />
            <Input label="Phone Number" placeholder="+1 (555) 000-0000" />
            <Input label="Street Address" placeholder="123 Main St" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" placeholder="San Francisco" />
              <Input label="Postal Code" placeholder="94103" />
            </div>
          </CardBody>
          <CardFooter>
            <Link to="/customer/orders">
              <Button className="w-full" icon={ArrowRight} iconPosition="right">
                Place Order ($299.00)
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Invoice Summary */}
        <Card className="h-fit">
          <CardHeader>
            <h3 className="font-bold text-base">Review Items</h3>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-app-bg-secondary flex items-center justify-center font-bold text-xs border">1x</span>
                <span>Premium Headphones</span>
              </div>
              <span className="font-bold">$299.00</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
export default Checkout;
