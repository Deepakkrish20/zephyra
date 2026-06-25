import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

// Form validation schema
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const Register = () => {
  const { register: registerAction, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      await registerAction(data.name, data.email, data.password);
      toast.success('Registration successful! Please verify your account.');
      reset();
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-app-bg-primary border border-app-border rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-center text-app-text-primary mb-6">Create Customer Account</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-app-text-secondary mb-1">
            Full Name
          </label>
          <input
            type="text"
            {...register('name')}
            className={`w-full px-3 py-2 border rounded-lg bg-app-bg-primary text-app-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow ${
              errors.name ? 'border-danger-500 focus:ring-danger-500' : 'border-app-border'
            }`}
            placeholder="John Doe"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-danger-500 font-medium">{errors.name.message}</p>
          )}
        </div>

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
            placeholder="john.doe@example.com"
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
            placeholder="•••••••• (min 6 characters)"
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
          className="w-full bg-primary-500 hover:bg-primary-600 text-zinc-950 font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-app-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-semibold hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;
