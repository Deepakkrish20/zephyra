import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Truck, Package, Activity, AlertTriangle } from 'lucide-react';
import adminApi from '@/services/adminApi';
import { Loader } from '@/components/Loader';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    grossRevenue: 0,
    totalActiveOrders: 0,
    pendingApprovalCount: 0,
    totalProducts: 0,
    draftProducts: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    try {
      const response = await adminApi.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setError(err.message || 'Could not fetch ops console data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const getBadgeProps = (status) => {
    switch (status) {
      case 'pending_approval':
        return { variant: 'warning', text: 'Pending Approval' };
      case 'approved':
        return { variant: 'secondary', text: 'Approved' };
      case 'accepted':
        return { variant: 'secondary', text: 'Courier Accepted' };
      case 'picked_up':
        return { variant: 'primary', text: 'Picked Up' };
      case 'out_for_delivery':
        return { variant: 'primary', text: 'Dispatched' };
      case 'delivered':
        return { variant: 'success', text: 'Delivered' };
      case 'rejected':
        return { variant: 'danger', text: 'Rejected' };
      default:
        return { variant: 'neutral', text: status || 'Unknown' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader size="lg" text="Loading operation console metrics..." color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 text-danger-700 dark:text-danger-400 rounded-xl flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Console Connection Failure</h4>
          <p className="text-xs font-semibold mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Gross Revenue',
      value: `$${stats.grossRevenue.toFixed(2)}`,
      icon: Activity,
      change: 'Settled deliveries',
      color: 'primary',
    },
    {
      title: 'Total Dispatched Orders',
      value: `${stats.totalActiveOrders} Active`,
      icon: Truck,
      change: `${stats.pendingApprovalCount} pending approval`,
      color: 'secondary',
    },
    {
      title: 'Total Catalog Products',
      value: `${stats.totalProducts} Items`,
      icon: Package,
      change: `${stats.draftProducts} in draft state`,
      color: 'neutral',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Operations Console</h1>
        <p className="text-sm text-app-text-secondary">
          Global metrics, live dispatches, and catalog controls.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} hoverEffect>
              <CardBody className="flex items-center justify-between p-6">
                <div className="space-y-2">
                  <p className="text-xs text-app-text-secondary font-bold uppercase tracking-wider">
                    {m.title}
                  </p>
                  <p className="text-3xl font-extrabold text-app-text-primary">{m.value}</p>
                  <p className="text-xs text-secondary-600 dark:text-secondary-400 font-bold">
                    {m.change}
                  </p>
                </div>
                <div className="p-4 bg-app-bg-secondary border border-app-border rounded-2xl">
                  <Icon className="w-6 h-6 text-primary-500" />
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <h3 className="font-bold text-base">Recent Workflow Transactions</h3>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-app-bg-secondary border-b border-app-border text-app-text-secondary font-bold">
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Client</th>
                  <th className="px-6 py-3.5">Workflow Status</th>
                  <th className="px-6 py-3.5">Assigned Courier</th>
                  <th className="px-6 py-3.5 font-bold">Total Bill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-app-text-secondary font-medium"
                    >
                      No order transactions found in the database.
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => {
                    const badge = getBadgeProps(order.status);
                    return (
                      <tr
                        key={order._id}
                        className="hover:bg-app-bg-secondary/40 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-primary-600">
                          #ZEP-{order._id.substring(18).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 font-semibold">
                          {order.shippingAddress?.fullName || 'Guest'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={badge.variant} dot>
                            {badge.text}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-app-text-secondary">
                          {order.deliveryAgent?.name || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 font-bold text-app-text-primary">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminDashboard;
