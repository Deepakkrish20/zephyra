import React from 'react';
import { Modal } from '@/components/Modal';
import { Badge } from '@/components/Badge';
import { Loader } from '@/components/Loader';
import { Button } from '@/components/Button';
import { User, MapPin, Package, Calendar } from 'lucide-react';

export const AdminOrderDetailsModal = ({ isOpen, onClose, order, loading }) => {
  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Loading Order Details...">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader size="lg" text="Retrieving complete order data..." color="primary" />
        </div>
      </Modal>
    );
  }

  if (!order) {
    return null;
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending_approval':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order Details — ${order.orderNumber}`}
      size="lg"
    >
      <div className="space-y-6 text-sm">
        {/* Status and date */}
        <div className="flex justify-between items-center bg-app-bg-secondary/45 p-4 rounded-xl border border-app-border">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-app-text-secondary" />
            <div>
              <p className="text-[10px] text-app-text-secondary font-bold uppercase tracking-wider">
                Date Placed
              </p>
              <p className="font-extrabold text-app-text-primary">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-app-text-secondary font-bold uppercase tracking-wider mb-1">
              Workflow State
            </p>
            <Badge variant={getStatusVariant(order.status)} dot>
              {order.status}
            </Badge>
          </div>
        </div>

        {/* Customer Information */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-app-text-primary font-bold">
            <User className="w-4 h-4 text-primary-600" />
            <h4 className="text-xs uppercase tracking-wider">Customer Profile</h4>
          </div>
          <div className="p-4 bg-app-bg-primary border border-app-border rounded-xl space-y-1 text-xs">
            <p className="font-black text-app-text-primary">
              {order.customer?.name || 'Guest Customer'}
            </p>
            <p className="text-app-text-secondary font-medium">
              Email: {order.customer?.email || 'guest@example.com'}
            </p>
            <p className="text-app-text-secondary font-medium">Customer ID: {order.customerId}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-app-text-primary font-bold">
            <MapPin className="w-4 h-4 text-primary-600" />
            <h4 className="text-xs uppercase tracking-wider">Shipping Details</h4>
          </div>
          <div className="p-4 bg-app-bg-primary border border-app-border rounded-xl space-y-1.5 text-xs">
            <p className="font-black text-app-text-primary">{order.shippingAddress.fullName}</p>
            <p className="text-app-text-secondary font-semibold">
              Phone: {order.shippingAddress.phoneNumber}
            </p>
            <p className="text-app-text-secondary font-medium">
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
            </p>
            <p className="text-app-text-secondary font-medium">
              {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
              {order.shippingAddress.postalCode}
            </p>
            {order.shippingAddress.landmark && (
              <p className="text-[10px] italic text-app-text-secondary font-medium">
                Landmark: {order.shippingAddress.landmark}
              </p>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-app-text-primary font-bold">
            <Package className="w-4 h-4 text-primary-600" />
            <h4 className="text-xs uppercase tracking-wider">Ordered Products</h4>
          </div>
          <div className="border border-app-border rounded-xl divide-y divide-app-border overflow-hidden">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 text-xs bg-app-bg-primary hover:bg-app-bg-secondary/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-app-bg-secondary border border-app-border flex items-center justify-center font-bold text-app-text-primary">
                    {item.quantity}x
                  </div>
                  <div>
                    <p className="font-extrabold text-app-text-primary">{item.productName}</p>
                    <p className="text-[10px] text-app-text-secondary">
                      ${parseFloat(item.productPrice).toFixed(2)} each
                    </p>
                  </div>
                </div>
                <span className="font-black text-app-text-primary">
                  ${parseFloat(item.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Amount Billing */}
        <div className="p-4 bg-app-bg-secondary/25 rounded-xl border border-app-border space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-app-text-secondary">Subtotal</span>
            <span className="text-app-text-primary">
              ${parseFloat(order.totalAmount).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-app-text-secondary">Shipping Cost</span>
            <span className="text-success-600 dark:text-success-400 font-bold uppercase">Free</span>
          </div>
          <hr className="border-app-border" />
          <div className="flex justify-between items-baseline font-black text-base text-app-text-primary">
            <span>Grand Total</span>
            <span className="text-primary-600 dark:text-primary-400">
              ${parseFloat(order.totalAmount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="md" onClick={onClose} className="font-bold cursor-pointer">
            Close Panel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AdminOrderDetailsModal;
