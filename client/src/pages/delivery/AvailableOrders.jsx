import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { MapPin, DollarSign, Loader2, PackageOpen, User } from 'lucide-react';
import { deliveryApi } from '@/services/deliveryApi';
import toast from 'react-hot-toast';

export const AvailableOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await deliveryApi.getAvailableJobs();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load available job offers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleAcceptJob = async (orderId) => {
    try {
      setAcceptingId(orderId);
      await deliveryApi.acceptJob(orderId);
      toast.success('Delivery job claimed successfully!');
      fetchJobs();
    } catch (error) {
      console.error('Error claiming job:', error);
      toast.error(error.response?.data?.message || 'Failed to claim delivery job.');
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        <p className="text-sm text-app-text-secondary font-medium animate-pulse">Scanning for nearby dispatch offers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Available Delivery Job Offers</h1>
        <p className="text-sm text-app-text-secondary">First-come first-served route dispatches. Accept tasks below.</p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-app-bg-primary text-center space-y-4">
          <div className="p-4 bg-app-bg-secondary rounded-full border">
            <PackageOpen className="w-8 h-8 text-app-text-secondary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base">No Job Offers Available</h3>
            <p className="text-xs text-app-text-secondary max-w-sm">All orders have been dispatched or claimed. Refresh later for new routes.</p>
          </div>
          <Button variant="primary" size="sm" onClick={fetchJobs}>Refresh Board</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => {
            // Dynamic delivery fee calculation: $8.50 base + 5% of order value
            const payoutRate = 8.5 + order.totalAmount * 0.05;

            return (
              <Card key={order._id} hoverEffect className="flex flex-col justify-between">
                <CardHeader className="flex justify-between items-center">
                  <div>
                    <span className="text-xs text-app-text-secondary">Order Reference</span>
                    <p className="font-bold text-sm">#{order.orderNumber}</p>
                  </div>
                  <Badge variant="primary" dot>Available Now</Badge>
                </CardHeader>
                <CardBody className="space-y-3">
                  <div className="flex gap-2 items-start text-sm">
                    <User className="w-4 h-4 text-app-text-secondary mt-0.5" />
                    <div>
                      <p className="font-bold text-xs text-app-text-secondary uppercase">Recipient</p>
                      <p className="font-medium">{order.shippingAddress?.fullName || 'Customer'}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start text-sm">
                    <MapPin className="w-4 h-4 text-danger-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs text-app-text-secondary uppercase">Delivery Address</p>
                      <p>
                        {order.shippingAddress?.addressLine1}
                        {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
                        , {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start text-sm">
                    <DollarSign className="w-4 h-4 text-success-500 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs text-app-text-secondary uppercase">Payout Rate</p>
                      <p className="font-bold text-success-600">${payoutRate.toFixed(2)} base + tips</p>
                    </div>
                  </div>
                </CardBody>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleAcceptJob(order._id)}
                    loading={acceptingId === order._id}
                  >
                    Accept Delivery Job
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

export default AvailableOrders;
