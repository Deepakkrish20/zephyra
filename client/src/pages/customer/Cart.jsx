import React from 'react';
import { Card, CardBody, CardFooter } from '@/components/Card';
import { Button } from '@/components/Button';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Cart = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart list */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardBody className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-app-bg-secondary rounded-lg flex items-center justify-center font-bold text-xs text-app-text-secondary border">
                  Img
                </div>
                <div>
                  <h3 className="font-bold text-sm">Premium Headphones (Mock Item)</h3>
                  <span className="text-xs text-app-text-secondary">Quantity: 1</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm">$299.00</p>
                <button className="text-danger-500 hover:underline text-xs flex items-center gap-1 mt-1 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Summary Card */}
        <div>
          <Card>
            <CardBody className="space-y-4">
              <h3 className="font-bold text-base border-b pb-2">Order Summary</h3>
              <div className="flex justify-between text-sm">
                <span className="text-app-text-secondary">Subtotal</span>
                <span>$299.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-app-text-secondary">Delivery Fee</span>
                <span className="text-success-600 font-semibold">FREE</span>
              </div>
              <hr className="border-app-border" />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-primary-600">$299.00</span>
              </div>
            </CardBody>
            <CardFooter>
              <Link to="/customer/checkout">
                <Button className="w-full" icon={ArrowRight} iconPosition="right">
                  Proceed to Checkout
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
export default Cart;
