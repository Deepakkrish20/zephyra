import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  Headphones,
  ShoppingCart,
  TrendingUp,
  Package,
  CreditCard,
  MapPin,
  Mail
} from 'lucide-react';

// Form validation schema
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const Register = () => {
  const { register: registerAction, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-200px)] py-8 animate-fadeIn relative">
      {/* Scope-contained custom styles to guarantee color specificity and wave motion */}
      <style>{`
        .headline-smart-commerce {
          color: #000000 !important;
        }
        .dark .headline-smart-commerce {
          color: #ffffff !important;
        }
        @keyframes wave-move-1 {
          0%, 100% { transform: translate(0, 0) scaleY(1); }
          50% { transform: translate(-20px, 8px) scaleY(1.05); }
        }
        @keyframes wave-move-2 {
          0%, 100% { transform: translate(0, 0) scaleY(1); }
          50% { transform: translate(15px, -6px) scaleY(0.95); }
        }
        .animate-wave-1 {
          animation: wave-move-1 12s ease-in-out infinite alternate;
        }
        .animate-wave-2 {
          animation: wave-move-2 15s ease-in-out infinite alternate;
        }
      `}</style>

      {/* Left side (Editorial feature grid) - 7 cols */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-8 relative overflow-hidden select-none pr-8 bg-[radial-gradient(circle_at_bottom_left,rgba(113,235,68,0.06),transparent_55%)] min-h-[520px]">
        
        {/* Separated ZEPHYRA Watermark background with clean character tracking */}
        <div className="absolute top-[-10px] left-0 text-[8vw] lg:text-[7rem] font-extrabold tracking-[0.25em] text-slate-100 dark:text-zinc-950/20 pointer-events-none select-none z-0 leading-none uppercase">
          ZEPHYRA
        </div>

        {/* Headline */}
        <div className="space-y-4 relative z-10 pt-28 pl-4">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight headline-smart-commerce">
              Smart Commerce.
              <br />
              <span className="text-[#71eb44]">Real-Time Delivery.</span>
            </h1>
            <div className="w-12 h-1 bg-[#71eb44] rounded-full" />
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm leading-relaxed">
              Zephyra brings technology and logistics together for a seamless delivery experience.
            </p>
          </div>

          {/* Feature points row */}
          <div className="flex items-center gap-6 pt-6 border-t border-slate-100 dark:border-zinc-800/80 w-full max-w-xl">
            {/* Item 1 */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary-50 dark:bg-primary-500/10 text-[#71eb44] border border-primary-100/50 dark:border-primary-500/10">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Lightning Fast</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Deliveries</p>
              </div>
            </div>
            
            {/* Divider line */}
            <div className="w-[1px] h-8 bg-slate-200 dark:bg-zinc-800" />

            {/* Item 2 */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary-50 dark:bg-primary-500/10 text-[#71eb44] border border-primary-100/50 dark:border-primary-500/10">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Secure &</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Reliable</p>
              </div>
            </div>

            {/* Divider line */}
            <div className="w-[1px] h-8 bg-slate-200 dark:bg-zinc-800" />

            {/* Item 3 */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary-50 dark:bg-primary-500/10 text-[#71eb44] border border-primary-100/50 dark:border-primary-500/10">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">24/7 Customer</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Static Curve Illustration matching the screenshot layout */}
        <div className="relative w-full h-[320px] select-none z-10">
          
          {/* Dashed Connected Curve Path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 600 320" fill="none">
            <path 
              d="M90,260 Q10,180 50,110 T250,90 T480,160 T420,280 T250,300 Z" 
              stroke="#71eb44" 
              strokeWidth="1.5" 
              strokeDasharray="4 6" 
              className="opacity-55"
            />
            
            {/* Pedestal Base */}
            <ellipse cx="90" cy="275" rx="55" ry="12" fill="#cbfa9d" opacity="0.6" />
            <ellipse cx="90" cy="270" rx="55" ry="12" fill="#e5fad0" />
            <path d="M35,270 L35,275 A55,12 0 0,0 145,275 L145,270 Z" fill="#71eb44" opacity="0.4" />
            
            {/* 3D Isometric Package Box */}
            {/* Top face */}
            <polygon points="90,220 125,235 90,250 55,235" fill="#71eb44" />
            {/* Left face */}
            <polygon points="55,235 90,250 90,280 55,265" fill="#3ea31a" />
            {/* Right face */}
            <polygon points="90,250 125,235 125,280 90,280" fill="#318016" />
            {/* Outline of shopping bag emblem on right face */}
            <path d="M102,260 L108,260 L108,266 L102,266 Z M104,260 C104,257 106,257 106,260" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.9" />
          </svg>

          {/* Node 1: Shopping Cart Card */}
          <div className="absolute left-[15px] top-[100px] w-[55px] h-[55px] bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 rounded-2xl shadow-md flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-[#71eb44]" />
          </div>

          {/* Node 2: Analytics Chart Card */}
          <div className="absolute left-[240px] top-[70px] w-[55px] h-[55px] bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 rounded-2xl shadow-md flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#71eb44]" />
          </div>

          {/* Node 3: Package Box Card */}
          <div className="absolute right-[40px] top-[150px] w-[55px] h-[55px] bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 rounded-2xl shadow-md flex items-center justify-center">
            <Package className="w-5 h-5 text-[#71eb44]" />
          </div>

          {/* Node 4: Credit Card Card */}
          <div className="absolute right-[110px] bottom-[50px] w-[65px] h-[55px] bg-white dark:bg-zinc-950 border border-slate-100 dark:border-zinc-900 rounded-2xl shadow-md flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-[#71eb44]" />
          </div>

          {/* Node 5: Map Pin location indicator */}
          <div className="absolute left-[230px] bottom-[60px] w-[40px] h-[40px] flex items-center justify-center">
            <MapPin className="w-6 h-6 text-[#71eb44]" fill="#71eb44" />
          </div>

        </div>

        {/* Animated Rolling Waves at bottom left */}
        <div className="absolute bottom-0 left-0 w-full h-[150px] overflow-hidden pointer-events-none z-0">
          <svg className="absolute bottom-0 left-0 w-[120%] h-[130px] pointer-events-none" viewBox="0 0 500 130" preserveAspectRatio="none">
            <path 
              className="animate-wave-2 fill-primary-100/20 dark:fill-primary-950/15"
              d="M0,80 C120,40 200,120 350,90 C450,70 500,120 500,120 L500,150 L0,150 Z" 
            />
          </svg>
          <svg className="absolute bottom-0 left-0 w-[120%] h-[110px] pointer-events-none" viewBox="0 0 500 110" preserveAspectRatio="none">
            <path 
              className="animate-wave-1 fill-primary-200/30 dark:fill-primary-900/10"
              d="M0,60 C150,110 280,30 400,80 C460,100 500,70 500,70 L500,130 L0,130 Z" 
            />
          </svg>
        </div>
      </div>

      {/* Right side (Register Card) - 5 cols */}
      <div className="w-full lg:col-span-5 flex justify-center">
        <div className="w-full max-w-md p-8 bg-app-bg-primary border border-app-border rounded-2xl shadow-md relative">
          
          {/* Top Green Bag Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-primary-100 dark:bg-primary-500/10 rounded-2xl border border-primary-200/25">
              <ShoppingBag className="w-8 h-8 text-primary-500" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-center text-app-text-primary mb-6">
            Create Customer Account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-app-text-secondary mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-app-bg-primary text-app-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow ${
                    errors.name ? 'border-danger-500 focus:ring-danger-500' : 'border-app-border'
                  }`}
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-danger-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-app-text-secondary mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg bg-app-bg-primary text-app-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow ${
                    errors.email ? 'border-danger-500 focus:ring-danger-500' : 'border-app-border'
                  }`}
                  placeholder="john.doe@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-danger-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-app-text-secondary mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg bg-app-bg-primary text-app-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow ${
                    errors.password ? 'border-danger-500 focus:ring-danger-500' : 'border-app-border'
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#71eb44] hover:bg-[#71eb44]/90 text-zinc-950 font-bold py-2.5 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-sm"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>



          {/* Already have account signup link */}
          <div className="mt-6 text-center font-mono text-[10px] text-app-text-secondary tracking-wider">
            <span>ALREADY HAVE AN ACCOUNT? </span>
            <Link to="/login" className="text-primary-500 font-bold hover:underline">
              LOGIN HERE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
