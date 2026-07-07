import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShoppingBag, ArrowRight, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCheckoutStore } from '@/features/checkout/store/checkoutStore';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/Card';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Loader } from '@/components/Loader';

// 1. Define Zod Schema for Shipping Address
const shippingSchema = z.object({
  fullName: z.string().min(2, 'Full Name must be at least 2 characters'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^\+?[0-9\s() -]+$/, 'Invalid phone number format'),
  addressLine1: z.string().min(5, 'Address must be at least 5 characters'),
  addressLine2: z.string().optional(),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State is required'),
  postalCode: z
    .string()
    .min(5, 'Postal code must be at least 5 characters')
    .regex(/^[0-9A-Za-z\s-]+$/, 'Invalid postal code format'),
  landmark: z.string().min(3, 'Landmark is required to help delivery agents locate you'),
});

export const Checkout = () => {
  const navigate = useNavigate();
  const {
    shippingInfo,
    checkoutSummary,
    totalAmount,
    loading: checkoutLoading,
    getCheckoutSummary,
    validateCheckout,
    saveShippingInfo,
    clearCheckout,
  } = useCheckoutStore();

  const { getCart } = useCartStore();
  const { createOrder, loading: orderLoading } = useOrderStore();

  const [validationSuccess, setValidationSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [generalError, setGeneralError] = useState('');

  // 2. React Hook Form Setup with Zod Resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(shippingSchema),
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

  useEffect(() => {
    getCheckoutSummary();
  }, [getCheckoutSummary]);

  const handleCheckoutSubmit = async (data) => {
    setValidationSuccess(false);
    setValidationErrors([]);
    setGeneralError('');

    try {
      // Validate cart and stock on backend
      const result = await validateCheckout(data);
      if (result.success) {
        saveShippingInfo(data);
        setValidationSuccess(true);
        // Refresh local cart store icon badge
        await getCart();
      }
    } catch (err) {
      if (err.errors && err.errors.length > 0) {
        setValidationErrors(err.errors);
      } else {
        setGeneralError(err.message || 'Checkout validation failed.');
      }
    }
  };

  const handleResetForm = () => {
    reset();
    setValidationSuccess(false);
    setValidationErrors([]);
    setGeneralError('');
  };

  const handlePlaceOrder = async () => {
    setGeneralError('');
    try {
      if (!shippingInfo) {
        setGeneralError('Shipping information is missing. Please re-validate form.');
        return;
      }
      await createOrder(shippingInfo);
      clearCheckout();
      await getCart();
      navigate('/customer/orders');
    } catch (err) {
      setGeneralError(err.message || 'Failed to place order.');
    }
  };

  const isCartEmpty = !checkoutSummary || checkoutSummary.items.length === 0;

  if (checkoutLoading && isCartEmpty) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader size="lg" text="Preparing checkout session..." color="primary" />
      </div>
    );
  }

  if (isCartEmpty) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed border-app-border rounded-2xl text-center space-y-4 max-w-xl mx-auto my-12 animate-fadeIn">
        <div className="p-3 bg-app-bg-secondary rounded-full text-app-text-secondary">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-bold text-app-text-primary text-lg">Your Cart is Empty</h3>
          <p className="text-sm text-app-text-secondary mt-1">
            You must add items to your cart before proceeding to checkout.
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
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-app-text-primary">Checkout Order</h1>
        <p className="text-xs text-app-text-secondary mt-0.5">
          Please provide your shipping address to validate your delivery coordinates.
        </p>
      </div>

      {/* Backend errors notification */}
      {generalError && (
        <div className="p-4 bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 text-danger-700 dark:text-danger-400 text-xs font-semibold rounded-xl flex items-center gap-2 max-w-3xl">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="p-4 bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20 text-danger-700 dark:text-danger-400 rounded-xl max-w-3xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Inventory & Availability Errors Found:</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 font-medium pl-2">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Notification */}
      {validationSuccess && (
        <div className="p-5 bg-success-50 dark:bg-success-500/10 border border-success-100 dark:border-success-500/20 text-success-800 dark:text-success-400 rounded-xl max-w-3xl space-y-3">
          <div className="flex items-center gap-2 font-black text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-success-600 dark:text-success-400" />
            <span>Checkout Validation Passed!</span>
          </div>
          <p className="text-xs font-medium">
            Shipping address meets format checks, and product stocks have been locked. Order records
            will be generated in the next phase.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetForm}
            className="font-bold text-xs cursor-pointer"
          >
            Edit Address Form
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipping Form Column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="font-bold text-base text-app-text-primary">Shipping Address</h3>
            </CardHeader>
            <form onSubmit={handleSubmit(handleCheckoutSubmit)}>
              <CardBody className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="Jane Doe"
                  disabled={validationSuccess || checkoutLoading}
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />

                <Input
                  label="Phone Number"
                  placeholder="e.g., +15550000000"
                  disabled={validationSuccess || checkoutLoading}
                  error={errors.phoneNumber?.message}
                  {...register('phoneNumber')}
                />

                <Input
                  label="Street Address"
                  placeholder="123 Main St"
                  disabled={validationSuccess || checkoutLoading}
                  error={errors.addressLine1?.message}
                  {...register('addressLine1')}
                />

                <Input
                  label="Apartment, suite, unit, etc. (Optional)"
                  placeholder="Apt 4B"
                  disabled={validationSuccess || checkoutLoading}
                  error={errors.addressLine2?.message}
                  {...register('addressLine2')}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    placeholder="San Francisco"
                    disabled={validationSuccess || checkoutLoading}
                    error={errors.city?.message}
                    {...register('city')}
                  />
                  <Input
                    label="State / Province"
                    placeholder="California"
                    disabled={validationSuccess || checkoutLoading}
                    error={errors.state?.message}
                    {...register('state')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Postal Code"
                    placeholder="94103"
                    disabled={validationSuccess || checkoutLoading}
                    error={errors.postalCode?.message}
                    {...register('postalCode')}
                  />
                  <Input
                    label="Landmark"
                    placeholder="Opposite Central Park"
                    disabled={validationSuccess || checkoutLoading}
                    error={errors.landmark?.message}
                    {...register('landmark')}
                  />
                </div>
              </CardBody>

              {validationSuccess ? (
                <CardFooter>
                  <Button
                    type="button"
                    variant="primary"
                    className="w-full font-black cursor-pointer bg-success-600 hover:bg-success-700 text-white"
                    icon={CheckCircle2}
                    iconPosition="left"
                    isLoading={orderLoading}
                    onClick={handlePlaceOrder}
                  >
                    Place Cash on Delivery Order (₹{totalAmount.toFixed(2)})
                  </Button>
                </CardFooter>
              ) : (
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full font-bold cursor-pointer"
                    icon={ArrowRight}
                    iconPosition="right"
                    isLoading={checkoutLoading}
                  >
                    Validate Checkout Order (₹{totalAmount.toFixed(2)})
                  </Button>
                </CardFooter>
              )}
            </form>
          </Card>
        </div>

        {/* Invoice Summary Column */}
        <div>
          <Card className="h-fit bg-app-bg-primary border border-app-border rounded-xl shadow-sm">
            <CardHeader>
              <h3 className="font-bold text-base text-app-text-primary">Review Items</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {checkoutSummary.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded bg-app-bg-secondary flex items-center justify-center font-black border border-app-border flex-shrink-0 text-app-text-primary">
                      {item.quantity}x
                    </div>
                    <div>
                      <p className="font-extrabold text-app-text-primary line-clamp-1 max-w-[150px]">
                        {item.product.name}
                      </p>
                      <span className="text-[10px] text-app-text-secondary">
                        {item.product.category}
                      </span>
                    </div>
                  </div>
                  <span className="font-black text-app-text-primary">
                    ₹{item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}

              <hr className="border-app-border" />

              <div className="flex justify-between text-xs font-semibold">
                <span className="text-app-text-secondary">Subtotal</span>
                <span className="text-app-text-primary">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-app-text-secondary">Shipping</span>
                <span className="text-success-600 dark:text-success-400 font-bold uppercase">
                  Free
                </span>
              </div>

              <hr className="border-app-border" />

              <div className="flex justify-between items-baseline font-black text-base text-app-text-primary">
                <span>Total</span>
                <span className="text-primary-600 dark:text-primary-400">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </CardBody>
            <CardBody className="bg-app-bg-secondary border-t border-app-border rounded-b-xl flex items-center gap-2.5 text-app-text-secondary">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 text-success-600" />
              <span className="text-[10px] font-semibold leading-relaxed">
                Stock is reserved for 15 minutes to guarantee real-time delivery GPS routing logs.
              </span>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
