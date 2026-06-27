import React, { useEffect, useState } from 'react';
import { Package, Compass, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useOrderStore } from '@/store/orderStore';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Modal } from '@/components/Modal';

export const Orders = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { orders, getOrders, getOrderById, selectedOrder } = useOrderStore();

  useEffect(() => {
    getOrders().finally(() => setInitialLoading(false));
  }, []);

  const handleOpenInvoice = async (orderId) => {
    setIsModalOpen(true);
    await getOrderById(orderId);
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        <span className="text-sm text-app-text-secondary mt-3">Loading your orders...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-app-border rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="p-3 bg-app-bg-secondary rounded-full text-app-text-secondary">
          <Package className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-bold text-app-text-primary text-lg">No Orders Found</h3>
          <p className="text-sm text-app-text-secondary mt-1">
            You haven&apos;t placed any orders yet.
          </p>
        </div>
        <Link to="/products">
          <Button variant="primary" size="md" className="font-bold cursor-pointer">
            Explore Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Orders</h1>
        <p className="text-sm text-app-text-secondary">Monitor your active shipments and purchase history.</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id}>
            <CardHeader className="flex justify-between items-center bg-app-bg-secondary/40">
              <div className="space-y-1">
                <span className="text-xs text-app-text-secondary">Order Number</span>
                <p className="font-black text-sm text-app-text-primary">{order.orderNumber}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={order.status === 'delivered' ? 'success' : 'secondary'} dot>
                  {order.status}
                </Badge>
                <span className="text-xs text-app-text-secondary">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
            <CardBody className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                {order.items?.map((item, idx) => (
                  <p key={idx} className="text-sm font-semibold">
                    {item.quantity}x {item.productName || 'Product'}
                  </p>
                ))}
                <p className="text-xs text-app-text-secondary mt-1">Payment Method: Cash on Delivery</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-app-text-secondary">Total Amount</span>
                <p className="font-extrabold text-base text-primary-600">${parseFloat(order.totalAmount).toFixed(2)}</p>
              </div>
            </CardBody>
            <CardFooter className="flex justify-end gap-3">
              {['approved', 'accepted', 'picked_up', 'out_for_delivery'].includes(order.status) && (
                <Link to={`/customer/track`}>
                  <Button size="sm" icon={Compass} className="cursor-pointer">
                    Track Live GPS Location
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                icon={Receipt}
                onClick={() => handleOpenInvoice(order._id)}
              >
                Invoice Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Invoice Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedOrder ? `Invoice Details — ${selectedOrder.orderNumber}` : 'Loading Invoice...'}
        size="lg"
      >
        {selectedOrder ? (
          <div className="space-y-6 text-sm">
            {/* Status & Date */}
            <div className="flex justify-between items-center bg-app-bg-secondary/50 p-4 rounded-lg border border-app-border">
              <div>
                <p className="text-[10px] text-app-text-secondary font-medium uppercase">Order Date</p>
                <p className="font-bold text-app-text-primary text-xs">
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-app-text-secondary font-medium uppercase mb-0.5">Status</p>
                <Badge variant={selectedOrder.status === 'delivered' ? 'success' : 'secondary'} dot>
                  {selectedOrder.status}
                </Badge>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-2">
              <h4 className="font-black text-app-text-primary text-xs uppercase tracking-wider">Shipping Address</h4>
              <div className="p-4 bg-app-bg-primary border border-app-border rounded-lg space-y-1.5 text-xs">
                <p className="font-extrabold text-app-text-primary">{selectedOrder.shippingAddress.fullName}</p>
                <p className="text-app-text-secondary">Phone: {selectedOrder.shippingAddress.phoneNumber}</p>
                <p className="text-app-text-secondary">
                  {selectedOrder.shippingAddress.addressLine1}
                  {selectedOrder.shippingAddress.addressLine2 && `, ${selectedOrder.shippingAddress.addressLine2}`}
                </p>
                <p className="text-app-text-secondary">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}
                </p>
                {selectedOrder.shippingAddress.landmark && (
                  <p className="text-[10px] italic text-app-text-secondary font-medium">
                    Landmark: {selectedOrder.shippingAddress.landmark}
                  </p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="font-black text-app-text-primary text-xs uppercase tracking-wider">Ordered Items</h4>
              <div className="border border-app-border rounded-lg divide-y divide-app-border overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 text-xs bg-app-bg-primary hover:bg-app-bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded bg-app-bg-secondary border border-app-border flex items-center justify-center font-bold text-app-text-primary">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-bold text-app-text-primary">{item.productName}</p>
                        <p className="text-[10px] text-app-text-secondary">${parseFloat(item.productPrice).toFixed(2)} each</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-app-text-primary">${parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="p-4 bg-app-bg-secondary/30 rounded-lg border border-app-border space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-app-text-secondary">Subtotal</span>
                <span className="text-app-text-primary">${parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-app-text-secondary">Shipping</span>
                <span className="text-success-600 dark:text-success-400 font-bold">FREE</span>
              </div>
              <hr className="border-app-border" />
              <div className="flex justify-between items-baseline font-black text-base text-app-text-primary">
                <span>Grand Total</span>
                <span className="text-primary-600 dark:text-primary-400">${parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)} className="font-bold cursor-pointer">
                Close Invoice
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            <span className="text-sm text-app-text-secondary mt-3">Loading order details...</span>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
