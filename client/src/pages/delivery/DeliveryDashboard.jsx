import React, { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/Card';
import { Activity, Compass, Award, ClipboardCheck, Loader2 } from 'lucide-react';
import { deliveryApi } from '@/services/deliveryApi';
import toast from 'react-hot-toast';

export const DeliveryDashboard = () => {
  const [stats, setStats] = useState({
    completedOrdersCount: 0,
    totalEarnings: 0,
    totalTips: 0,
    averageRating: 5.0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await deliveryApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getRatingSubtext = (rating) => {
    if (rating >= 4.8) return 'Top Tier Agent';
    if (rating >= 4.5) return 'Highly Rated';
    return 'Active Service Agent';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        <p className="text-sm text-app-text-secondary font-medium animate-pulse">Retrieving your shift summary...</p>
      </div>
    );
  }

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
              <p className="text-3xl font-extrabold text-app-text-primary">{stats.completedOrdersCount} {stats.completedOrdersCount === 1 ? 'Order' : 'Orders'}</p>
              <p className="text-xs text-success-600 font-semibold">100% on-time rate</p>
            </div>
            <div className="p-4 bg-app-bg-secondary border rounded-xl">
              <ClipboardCheck className="w-6 h-6 text-primary-500" />
            </div>
          </CardBody>
        </Card>

        <Card hoverEffect>
          <CardBody className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs text-app-text-secondary font-bold uppercase tracking-wider">Active Earnings</p>
              <p className="text-3xl font-extrabold text-app-text-primary">${stats.totalEarnings.toFixed(2)}</p>
              <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">
                +${stats.totalTips.toFixed(2)} tips included
              </p>
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
              <p className="text-3xl font-extrabold text-app-text-primary">{stats.averageRating.toFixed(2)} / 5</p>
              <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">{getRatingSubtext(stats.averageRating)}</p>
            </div>
            <div className="p-4 bg-app-bg-secondary border rounded-xl">
              <Award className="w-6 h-6 text-primary-500" />
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
