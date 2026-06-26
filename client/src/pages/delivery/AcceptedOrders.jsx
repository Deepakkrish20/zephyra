import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { MapPin, CheckCircle, Compass, Loader2, Package, Phone, ShoppingBag, Truck, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { deliveryApi } from '@/services/deliveryApi';
import toast from 'react-hot-toast';

export const AcceptedOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchActiveJobs = async () => {
    try {
      setLoading(true);
      const data = await deliveryApi.getActiveJobs();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching active jobs:', error);
      toast.error('Failed to load active delivery contracts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveJobs();
  }, []);

  const handleStatusUpdate = async (orderId, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'accepted') nextStatus = 'picked_up';
    else if (currentStatus === 'picked_up') nextStatus = 'out_for_delivery';
    else if (currentStatus === 'out_for_delivery') nextStatus = 'delivered';

    if (!nextStatus) return;

    try {
      setUpdatingId(orderId);
      await deliveryApi.updateDeliveryStatus(orderId, nextStatus);
      toast.success(`Status updated to ${nextStatus.replace(/_/g, ' ')}!`);
      fetchActiveJobs();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update delivery status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="info" dot>Assigned / Accepted</Badge>;
      case 'picked_up':
        return <Badge variant="warning" dot>Picked Up</Badge>;
      case 'out_for_delivery':
        return <Badge variant="primary" dot>Out for Delivery</Badge>;
      case 'delivered':
        return <Badge variant="success" dot>Delivered</Badge>;
      default:
        return <Badge variant="secondary" dot>{status}</Badge>;
    }
  };

  const getActionButtonLabel = (status) => {
    switch (status) {
      case 'accepted':
        return 'Confirm Pickup';
      case 'picked_up':
        return 'Start Delivery Route';
      case 'out_for_delivery':
        return 'Confirm Delivery';
      default:
        return 'Update Status';
    }
  };

  const getActionButtonIcon = (status) => {
    switch (status) {
      case 'accepted':
        return Package;
      case 'picked_up':
        return Truck;
      case 'out_for_delivery':
        return CheckCircle;
      default:
        return CheckCircle;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        <p className="text-sm text-app-text-secondary font-medium animate-pulse">Loading your active delivery tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Active Delivery Contracts</h1>
        <p className="text-sm text-app-text-secondary">Execute route logistics, coordinate live GPS, and check off completed drop-offs.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-app-bg-primary text-center space-y-4">
          <div className="p-4 bg-app-bg-secondary rounded-full border">
            <ClipboardList className="w-8 h-8 text-app-text-secondary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base">No Active Contracts</h3>
            <p className="text-xs text-app-text-secondary max-w-sm">You do not have any active delivery runs. Visit the job board to claim orders.</p>
          </div>
          <Link to="/delivery/available-orders">
            <Button size="sm">Browse Job Offers</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {orders.map((order) => {
            const payoutRate = 8.5 + order.totalAmount * 0.05;

            return (
              <Card key={order._id} className="flex flex-col justify-between">
                <CardHeader className="flex justify-between items-center bg-app-bg-secondary/40">
                  <div>
                    <span className="text-xs text-app-text-secondary">Contract ID</span>
                    <p className="font-bold text-sm">#{order.orderNumber}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </CardHeader>
                <CardBody className="space-y-4">
                  {/* Delivery Location */}
                  <div className="flex gap-3 items-start text-sm">
                    <MapPin className="w-5 h-5 text-danger-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-xs text-app-text-secondary uppercase">Ship To</p>
                      <p className="font-semibold">{order.shippingAddress?.fullName || 'Customer'}</p>
                      <p className="text-app-text-secondary text-xs">
                        {order.shippingAddress?.addressLine1}
                        {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
                        , {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                      </p>
                    </div>
                  </div>

                  {/* Customer Phone */}
                  {order.shippingAddress?.phoneNumber && (
                    <div className="flex gap-3 items-start text-sm">
                      <Phone className="w-4 h-4 text-app-text-secondary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-xs text-app-text-secondary uppercase">Contact Number</p>
                        <p className="text-xs font-medium">{order.shippingAddress.phoneNumber}</p>
                      </div>
                    </div>
                  )}

                  {/* Order Items Summary */}
                  <div className="flex gap-3 items-start text-sm">
                    <ShoppingBag className="w-4 h-4 text-app-text-secondary mt-0.5 shrink-0" />
                    <div className="w-full">
                      <p className="font-bold text-xs text-app-text-secondary uppercase">Items list</p>
                      <div className="mt-1 divide-y border rounded-xl overflow-hidden bg-app-bg-secondary/20">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 text-xs">
                            <span className="font-medium truncate max-w-[200px]">{item.productName}</span>
                            <span className="text-app-text-secondary font-bold">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Visual Stepper */}
                  <div className="py-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-app-text-secondary uppercase tracking-wider mb-2">
                      <span>Status Tracker</span>
                      <span className="text-primary-600 dark:text-primary-400">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${order.status !== 'pending_approval' ? 'bg-primary-500' : 'bg-app-bg-secondary'}`} />
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${['picked_up', 'out_for_delivery', 'delivered'].includes(order.status) ? 'bg-primary-500' : 'bg-app-bg-secondary'}`} />
                      <div className={`h-1.5 rounded-full transition-all duration-300 ${['out_for_delivery', 'delivered'].includes(order.status) ? 'bg-primary-500' : 'bg-app-bg-secondary'}`} />
                    </div>
                  </div>

                  <div className="p-3 bg-primary-50 dark:bg-primary-500/10 border border-primary-100 dark:border-primary-500/20 rounded-xl text-primary-700 dark:text-primary-400 text-xs">
                    <strong>Payout rate:</strong> ${payoutRate.toFixed(2)} base + tips upon drop-off verification.
                  </div>
                </CardBody>
                <CardFooter className="flex gap-3 justify-end border-t pt-4">
                  <Link to={`/delivery/tracking?orderId=${order._id}`}>
                    <Button size="sm" variant="outline" icon={Compass}>Open GPS Compass</Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant={order.status === 'out_for_delivery' ? 'success' : 'primary'} 
                    icon={getActionButtonIcon(order.status)}
                    onClick={() => handleStatusUpdate(order._id, order.status)}
                    loading={updatingId === order._id}
                  >
                    {getActionButtonLabel(order.status)}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AcceptedOrders;
