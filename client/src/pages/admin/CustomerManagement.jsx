import { useState, useEffect, Fragment } from 'react';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { AlertTriangle, Send, CheckCircle2, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import adminApi from '@/services/adminApi';
import { TableSkeleton } from '@/components/Skeleton';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import toast from 'react-hot-toast';

export const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getCustomers();
      setCustomers(response?.data?.customers || []);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to retrieve registered customers';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSendReminder = async (customerId, email) => {
    try {
      setSendingId(customerId);
      await adminApi.sendVerificationReminder(customerId);
      toast.success(`Verification reminder sent to ${email}!`);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to send verification reminder';
      toast.error(errMsg);
    } finally {
      setSendingId(null);
    }
  };

  const handleToggleExpand = (customerId) => {
    setExpandedCustomerId((prev) => (prev === customerId ? null : customerId));
  };

  const unverifiedCustomers = customers.filter((c) => !c.isVerified);
  const verifiedCustomers = customers.filter((c) => c.isVerified);

  const renderAddressDetails = (customer, colSpan) => {
    const addrs = customer.addresses || [];
    return (
      <tr className="bg-app-bg-secondary/20 select-none">
        <td colSpan={colSpan} className="px-4 py-3 border-t border-app-border">
          <div className="space-y-2 text-left">
            <h4 className="text-xs font-bold text-app-text-secondary uppercase tracking-wider">
              Saved Shipping Addresses ({addrs.length})
            </h4>
            {addrs.length === 0 ? (
              <p className="text-xs text-app-text-secondary italic">No saved addresses for this customer.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                {addrs.map((addr, idx) => (
                  <div key={addr._id || idx} className="p-3 border border-app-border rounded-lg bg-app-bg-primary text-xs space-y-1">
                    <p className="font-bold text-app-text-primary">{addr.fullName}</p>
                    <p className="text-app-text-secondary">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className="text-app-text-secondary">{addr.addressLine2}</p>}
                    <p className="text-app-text-secondary">{addr.city}, {addr.state} {addr.postalCode}</p>
                    {addr.landmark && <p className="text-[10px] text-primary-600 dark:text-primary-400 font-bold">Landmark: {addr.landmark}</p>}
                    <p className="text-[10px] text-app-text-secondary font-mono pt-1">Phone: {addr.phoneNumber}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-app-text-primary">Customer Registries</h1>
          <p className="text-sm text-app-text-secondary mt-0.5">Manage user verification states and view saved addresses.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 text-danger-700 dark:text-danger-400 text-xs font-semibold rounded-xl flex items-center gap-2 max-w-2xl">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="p-5 bg-app-bg-primary border border-app-border rounded-xl">
            <div className="h-6 w-1/3 mb-6 bg-app-bg-secondary rounded-lg animate-pulse" />
            <TableSkeleton rows={4} cols={3} />
          </Card>
          <Card className="p-5 bg-app-bg-primary border border-app-border rounded-xl">
            <div className="h-6 w-1/3 mb-6 bg-app-bg-secondary rounded-lg animate-pulse" />
            <TableSkeleton rows={4} cols={3} />
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Unverified Customers Column */}
          <Card className="overflow-hidden bg-app-bg-primary border border-app-border rounded-xl">
            <CardHeader className="flex items-center gap-2 border-b border-app-border bg-danger-50/10 dark:bg-danger-500/5">
              <ShieldAlert className="w-5 h-5 text-warning-500" />
              <div>
                <h3 className="font-bold text-base text-app-text-primary">Pending Verification</h3>
                <p className="text-xs text-app-text-secondary">Customers who haven&apos;t completed email verification.</p>
              </div>
            </CardHeader>
            <CardBody className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-app-bg-secondary border-b border-app-border text-app-text-secondary font-bold text-xs uppercase tracking-wider select-none">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Registered</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {unverifiedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-app-text-secondary font-medium">
                        No pending verifications.
                      </td>
                    </tr>
                  ) : (
                    unverifiedCustomers.map((customer) => (
                      <Fragment key={customer._id}>
                        <tr
                          className="hover:bg-app-bg-secondary/40 transition-colors cursor-pointer"
                          onClick={() => handleToggleExpand(customer._id)}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              {expandedCustomerId === customer._id ? (
                                <ChevronUp className="w-4 h-4 text-app-text-secondary" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-app-text-secondary" />
                              )}
                              <div>
                                <div className="font-bold text-app-text-primary">{customer.name}</div>
                                <div className="text-xs text-app-text-secondary font-mono">{customer.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-app-text-secondary">
                            {new Date(customer.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="warning"
                              size="sm"
                              icon={sendingId === customer._id ? undefined : Send}
                              isLoading={sendingId === customer._id}
                              isDisabled={sendingId !== null}
                              onClick={() => handleSendReminder(customer._id, customer.email)}
                              className="text-xs font-bold"
                            >
                              Send Reminder
                            </Button>
                          </td>
                        </tr>
                        {expandedCustomerId === customer._id && renderAddressDetails(customer, 3)}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>

          {/* Verified Customers Column */}
          <Card className="overflow-hidden bg-app-bg-primary border border-app-border rounded-xl">
            <CardHeader className="flex items-center gap-2 border-b border-app-border bg-success-50/10 dark:bg-success-500/5">
              <CheckCircle2 className="w-5 h-5 text-success-500" />
              <div>
                <h3 className="font-bold text-base text-app-text-primary">Verified Accounts</h3>
                <p className="text-xs text-app-text-secondary">Active customers in the system.</p>
              </div>
            </CardHeader>
            <CardBody className="p-0 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-app-bg-secondary border-b border-app-border text-app-text-secondary font-bold text-xs uppercase tracking-wider select-none">
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Registered</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-border">
                  {verifiedCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-app-text-secondary font-medium">
                        No verified customer accounts.
                      </td>
                    </tr>
                  ) : (
                    verifiedCustomers.map((customer) => (
                      <Fragment key={customer._id}>
                        <tr
                          className="hover:bg-app-bg-secondary/40 transition-colors cursor-pointer"
                          onClick={() => handleToggleExpand(customer._id)}
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              {expandedCustomerId === customer._id ? (
                                <ChevronUp className="w-4 h-4 text-app-text-secondary" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-app-text-secondary" />
                              )}
                              <div>
                                <div className="font-bold text-app-text-primary">{customer.name}</div>
                                <div className="text-xs text-app-text-secondary font-mono">{customer.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-app-text-secondary">
                            {new Date(customer.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Badge variant="success" size="sm" dot>
                              Verified
                            </Badge>
                          </td>
                        </tr>
                        {expandedCustomerId === customer._id && renderAddressDetails(customer, 3)}
                      </Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
