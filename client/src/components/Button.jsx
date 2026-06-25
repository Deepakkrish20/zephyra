import React from 'react';

export const Button = React.forwardRef(({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-transform duration-100';
  
  const variants = {
    primary: 'bg-primary-500 hover:bg-primary-600 text-zinc-950 dark:bg-primary-500 dark:hover:bg-primary-600 dark:text-zinc-950 focus:ring-primary-400 shadow-lg shadow-primary-500/20 transition-all duration-200 font-bold',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white dark:bg-secondary-600 dark:hover:bg-secondary-700 dark:text-white focus:ring-zinc-400 dark:focus:ring-secondary-500 transition-all duration-200',
    outline: 'border border-zinc-200 hover:border-primary-500 hover:bg-primary-500 hover:text-zinc-950 dark:border-app-border dark:bg-transparent dark:text-app-text-primary dark:hover:bg-primary-500 dark:hover:text-zinc-950 transition-all duration-200',
    ghost: 'bg-transparent text-app-text-primary hover:bg-zinc-100 dark:hover:bg-app-bg-secondary transition-all duration-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm shadow-red-500/10 transition-all duration-200',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm shadow-emerald-500/10 transition-all duration-200',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500 shadow-sm shadow-amber-500/10 transition-all duration-200',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  const loadingSpinner = (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );

  return (
    <button
      ref={ref}
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isDisabled || isLoading}
      {...props}
    >
      {isLoading && loadingSpinner}
      {!isLoading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 mr-2" />}
      {children}
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 ml-2" />}
    </button>
  );
});

Button.displayName = 'Button';
