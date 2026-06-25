import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

// Form validation schema
const verifySchema = z.object({
  code: z.string()
    .length(6, 'Verification code must be exactly 6 digits')
    .regex(/^\d+$/, 'Verification code must only contain digits'),
});

export const VerifyEmail = () => {
  const { verifyEmail, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' },
  });

  const onSubmit = async (data) => {
    if (!email) {
      toast.error('No email address provided for verification.');
      return;
    }

    try {
      await verifyEmail(email, data.code);
      toast.success('Account verified successfully! You can now log in.');
      reset();
      navigate('/login');
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Verification failed';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-app-bg-primary border border-app-border rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-center text-app-text-primary mb-2">Verify Your Account</h2>
      <p className="text-sm text-center text-app-text-secondary mb-6">
        We sent a 6-digit verification code to <span className="font-semibold text-app-text-primary">{email || 'your email'}</span>. Please enter it below.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Verification Code */}
        <div>
          <label className="block text-sm font-semibold text-app-text-secondary mb-1">
            Verification Code
          </label>
          <input
            type="text"
            maxLength={6}
            {...register('code')}
            className={`w-full px-3 py-2 text-center text-lg tracking-[8px] font-bold border rounded-lg bg-app-bg-primary text-app-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow ${
              errors.code ? 'border-danger-500 focus:ring-danger-500' : 'border-app-border'
            }`}
            placeholder="000000"
            disabled={isLoading}
          />
          {errors.code && (
            <p className="mt-1 text-xs text-danger-500 font-medium text-center">{errors.code.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-zinc-950 hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 dark:text-zinc-950 text-white font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-app-text-secondary">
        Return to{' '}
        <Link to="/login" className="text-primary-600 font-semibold hover:underline">
          Login page
        </Link>
      </div>
    </div>
  );
};

export default VerifyEmail;
