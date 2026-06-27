import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { ROLES } from '@/constants/roles';

// Form validation schema
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const Login = () => {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}!`);
      
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === ROLES.ADMIN) {
        navigate('/admin');
      } else if (user.role === ROLES.DELIVERY_AGENT) {
        navigate('/delivery');
      } else {
        navigate('/customer');
      }
      reset();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-app-bg-primary border border-app-border rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-center text-app-text-primary mb-6">Login to Zephyra</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-app-text-secondary mb-1">
            Email Address
          </label>
          <input
            type="email"
            {...register('email')}
            className={`w-full px-3 py-2 border rounded-lg bg-app-bg-primary text-app-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow ${
              errors.email ? 'border-danger-500 focus:ring-danger-500' : 'border-app-border'
            }`}
            placeholder="email@example.com"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-danger-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-app-text-secondary mb-1">
            Password
          </label>
          <input
            type="password"
            {...register('password')}
            className={`w-full px-3 py-2 border rounded-lg bg-app-bg-primary text-app-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow ${
              errors.password ? 'border-danger-500 focus:ring-danger-500' : 'border-app-border'
            }`}
            placeholder="••••••••"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-danger-500 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#71eb44] hover:bg-[#71eb44]/90 text-zinc-950 font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Subtle First-time Customer Signup Link */}
      <div className="mt-6 text-center font-mono text-[10px] text-app-text-secondary tracking-wider">
        <span>NEW CUSTOMER? </span>
        <Link to="/register" className="text-app-text-primary font-bold hover:underline">
          CREATE AN ACCOUNT
        </Link>
      </div>
    </div>
  );
};

export default Login;
