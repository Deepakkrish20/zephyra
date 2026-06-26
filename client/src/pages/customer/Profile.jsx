import { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { User as UserIcon, Mail, ShieldAlert, MapPin, Trash2, Plus, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import authApi from '@/services/authApi';
import { Modal } from '@/components/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

// 1. Zod Validation Schema matching Checkout requirements
const addressSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  phoneNumber: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^\+?[0-9\s()-]+$/, 'Invalid phone number format'),
  addressLine1: z.string().min(5, 'Address must be at least 5 characters'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string()
    .min(5, 'Postal code must be at least 5 characters')
    .regex(/^[0-9A-Za-z\s-]+$/, 'Invalid postal code format'),
  landmark: z.string().optional(),
});

export const Profile = () => {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form Setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      landmark: '',
    },
  });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.getAddresses();
      setAddresses(res?.data?.addresses || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (data) => {
    setActionLoading(true);
    try {
      const res = await authApi.addAddress(data);
      setAddresses((prev) => [...prev, res.data.address]);
      toast.success('Shipping address added successfully!');
      setIsModalOpen(false);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save address');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this shipping address?')) return;
    setActionLoading(true);
    try {
      await authApi.deleteAddress(addressId);
      setAddresses((prev) => prev.filter((addr) => addr._id !== addressId));
      toast.success('Shipping address deleted!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete address');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-app-text-primary">Your Account Profile</h1>
        <p className="text-sm text-app-text-secondary mt-0.5">Update your credentials and contact preferences.</p>
      </div>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 border-b border-app-border pb-3">
            <UserIcon className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-base text-app-text-primary">Account Information</h3>
          </div>
        </CardHeader>
        <CardBody className="space-y-4 pt-3">
          <Input label="Full Name" defaultValue={user?.name || 'Jane Doe'} readOnly disabled />
          <Input label="Email Address" defaultValue={user?.email || 'jane@example.com'} icon={Mail} readOnly disabled />
          
          <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-100 dark:border-yellow-500/20 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-yellow-800 dark:text-yellow-400">Security Credentials</p>
              <p className="text-yellow-700 dark:text-yellow-300">
                Email and password editing is managed by the security provider. Contact support for registration modifications.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Shipping Address Manager Card */}
      <Card>
        <CardHeader className="flex justify-between items-center border-b border-app-border pb-3">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-secondary-600" />
            <h3 className="font-bold text-base text-app-text-primary">Saved Shipping Addresses</h3>
          </div>
          <Button size="sm" icon={Plus} onClick={() => setIsModalOpen(true)} className="font-bold cursor-pointer">
            Add Address
          </Button>
        </CardHeader>
        <CardBody className="space-y-4 pt-3">
          {error && (
            <div className="p-3 bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 text-danger-700 dark:text-danger-400 text-xs font-semibold rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-app-border rounded-xl space-y-3 bg-app-bg-secondary/20 animate-pulse">
                <div className="h-5 w-1/3 bg-app-bg-secondary rounded-lg" />
                <div className="h-4 w-3/4 bg-app-bg-secondary rounded-lg" />
                <div className="h-4 w-1/2 bg-app-bg-secondary rounded-lg" />
                <div className="pt-3 border-t border-app-border flex justify-end">
                  <div className="h-6 w-8 bg-app-bg-secondary rounded-lg" />
                </div>
              </div>
              <div className="p-4 border border-app-border rounded-xl space-y-3 bg-app-bg-secondary/20 animate-pulse">
                <div className="h-5 w-1/3 bg-app-bg-secondary rounded-lg" />
                <div className="h-4 w-3/4 bg-app-bg-secondary rounded-lg" />
                <div className="h-4 w-1/2 bg-app-bg-secondary rounded-lg" />
                <div className="pt-3 border-t border-app-border flex justify-end">
                  <div className="h-6 w-8 bg-app-bg-secondary rounded-lg" />
                </div>
              </div>
            </div>
          ) : addresses.length === 0 ? (
            <div className="py-8 text-center text-sm text-app-text-secondary">
              No saved addresses. Click &quot;Add Address&quot; to register shipping coordinates.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className="p-4 border border-app-border rounded-xl bg-app-bg-secondary/20 flex flex-col justify-between hover:border-primary-500/30 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-extrabold text-sm text-app-text-primary">{addr.fullName}</p>
                    <p className="text-xs text-app-text-secondary">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p className="text-xs text-app-text-secondary">{addr.addressLine2}</p>}
                    <p className="text-xs text-app-text-secondary">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                    {addr.landmark && <p className="text-[10px] text-primary-600 dark:text-primary-400 font-bold">Landmark: {addr.landmark}</p>}
                    <p className="text-[10px] text-app-text-secondary font-mono pt-1">Phone: {addr.phoneNumber}</p>
                  </div>
                  <div className="flex justify-end pt-3 mt-3 border-t border-app-border">
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      onClick={() => handleDeleteAddress(addr._id)}
                      isDisabled={actionLoading}
                      title="Delete address"
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Address Modal */}
      <Modal isOpen={isModalOpen} onClose={() => !actionLoading && setIsModalOpen(false)} title="Register Shipping Address">
        <form onSubmit={handleSubmit(handleAddAddress)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Jane Doe"
            disabled={actionLoading}
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Phone Number"
            placeholder="e.g., +15550000000"
            disabled={actionLoading}
            error={errors.phoneNumber?.message}
            {...register('phoneNumber')}
          />
          <Input
            label="Street Address"
            placeholder="123 Main St"
            disabled={actionLoading}
            error={errors.addressLine1?.message}
            {...register('addressLine1')}
          />
          <Input
            label="Apartment, suite, unit, etc. (Optional)"
            placeholder="Apt 4B"
            disabled={actionLoading}
            error={errors.addressLine2?.message}
            {...register('addressLine2')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="San Francisco"
              disabled={actionLoading}
              error={errors.city?.message}
              {...register('city')}
            />
            <Input
              label="State"
              placeholder="CA"
              disabled={actionLoading}
              error={errors.state?.message}
              {...register('state')}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Postal Code"
              placeholder="94103"
              disabled={actionLoading}
              error={errors.postalCode?.message}
              {...register('postalCode')}
            />
            <Input
              label="Landmark (Optional)"
              placeholder="Opposite Central Park"
              disabled={actionLoading}
              error={errors.landmark?.message}
              {...register('landmark')}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-app-border">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} isDisabled={actionLoading} className="font-bold cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" isLoading={actionLoading} className="font-bold cursor-pointer">
              Save Address
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
