import React, { useEffect, useState } from 'react';
import { useAdminOrderStore } from '../store/adminOrderStore';
import { Card, CardBody, CardFooter } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { Loader } from '@/components/Loader';
import { Input } from '@/components/Input';
import { AdminOrderDetailsModal } from '../components/AdminOrderDetailsModal';
import { Search, Eye, Check, X, AlertTriangle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export const AdminOrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const {
    orders,
    pagination,
    selectedOrder,
    loading,
    error,
    getOrders,
    getOrderById,
    approveOrder,
    rejectOrder,
  } = useAdminOrderStore();

  // Load orders when filter, search, or page changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      getOrders({
        page: currentPage,
        limit: 10,
        status: statusFilter,
        search: searchTerm,
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, statusFilter, searchTerm]);

  // Handle page resets on filter/search change
  const handleStatusChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleOpenDetails = async (id) => {
    setIsDetailsOpen(true);
    await getOrderById(id);
  };

  const handleApprove = async (id, orderNumber) => {
    if (window.confirm(`Are you sure you want to APPROVE Order ${orderNumber}?`)) {
      try {
        await approveOrder(id);
      } catch (err) {
        alert(err.message || 'Approval failed');
      }
    }
  };

  const handleReject = async (id, orderNumber) => {
    if (window.confirm(`Are you sure you want to REJECT Order ${orderNumber}?`)) {
      try {
        await rejectOrder(id);
      } catch (err) {
        alert(err.message || 'Rejection failed');
      }
    }
  };

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

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-app-text-primary">
            Admin Order Management
          </h1>
          <p className="text-xs text-app-text-secondary mt-0.5">
            Approve incoming customer purchases, review invoices, and supervise status transitions.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={() => getOrders({ page: currentPage, limit: 10, status: statusFilter, search: searchTerm })}
          isLoading={loading && orders.length > 0}
          className="cursor-pointer font-bold text-xs"
        >
          Refresh Logs
        </Button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 text-danger-700 dark:text-danger-400 text-xs font-semibold rounded-xl flex items-center gap-2 max-w-3xl">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-app-bg-primary border border-app-border p-4 rounded-xl shadow-xs">
        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleStatusChange(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === opt.value
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-app-bg-secondary text-app-text-secondary hover:text-app-text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="w-full md:w-72">
          <Input
            placeholder="Search Order Number (e.g. ZEP-)"
            value={searchTerm}
            onChange={handleSearchChange}
            icon={Search}
            className="text-xs py-2"
          />
        </div>
      </div>

      {/* Orders Table Card */}
      <Card>
        <CardBody className="p-0">
          {loading && orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader size="lg" text="Loading incoming order logs..." color="primary" />
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="p-3 bg-app-bg-secondary rounded-full text-app-text-secondary">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="font-extrabold text-app-text-primary text-base">No Orders Found</p>
                <p className="text-xs text-app-text-secondary mt-0.5">
                  We couldn&apos;t find any orders matching your criteria.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-app-bg-secondary/60 border-b border-app-border text-app-text-secondary font-bold uppercase tracking-wider">
                    <th className="px-6 py-3.5">Order Number</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Total Amount</th>
                    <th className="px-6 py-3.5">Date Created</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-app-bg-secondary/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-black text-app-text-primary">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-app-text-primary">
                            {order.customer?.name || 'Guest'}
                          </p>
                          <p className="text-[10px] text-app-text-secondary font-medium">
                            {order.customer?.email || ''}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-primary-600 dark:text-primary-400">
                        ${parseFloat(order.totalAmount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-app-text-secondary font-semibold">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(order.status)} dot>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-1.5">
                        <Button
                          size="xs"
                          variant="ghost"
                          icon={Eye}
                          onClick={() => handleOpenDetails(order._id)}
                          className="cursor-pointer font-bold text-xs"
                        >
                          Details
                        </Button>
                        
                        {order.status === 'pending_approval' && (
                          <>
                            <Button
                              size="xs"
                              variant="success"
                              icon={Check}
                              onClick={() => handleApprove(order._id, order.orderNumber)}
                              className="cursor-pointer font-bold text-xs"
                            >
                              Approve
                            </Button>
                            <Button
                              size="xs"
                              variant="danger"
                              icon={X}
                              onClick={() => handleReject(order._id, order.orderNumber)}
                              className="cursor-pointer font-bold text-xs"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <CardFooter className="flex items-center justify-between bg-app-bg-primary border-t border-app-border px-6 py-4">
            <span className="text-xs text-app-text-secondary font-bold">
              Showing Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={ChevronLeft}
                disabled={currentPage === 1 || loading}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="cursor-pointer"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={ChevronRight}
                iconPosition="right"
                disabled={currentPage === pagination.pages || loading}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pagination.pages))}
                className="cursor-pointer"
              >
                Next
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Details Modal */}
      <AdminOrderDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        order={selectedOrder}
        loading={loading && !selectedOrder}
      />
    </div>
  );
};

export default AdminOrdersPage;
