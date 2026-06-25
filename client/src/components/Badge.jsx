import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full tracking-wide transition-all';
  
  const variants = {
    primary: 'bg-primary-50 text-primary-800 dark:bg-primary-950/20 dark:text-primary-400 border border-primary-200 dark:border-primary-500/30',
    secondary: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-50/10 dark:text-secondary-400 border border-secondary-100 dark:border-secondary-500/20',
    success: 'bg-success-50 text-success-600 dark:bg-success-50/10 dark:text-success-400 border border-success-100 dark:border-success-500/20',
    warning: 'bg-warning-50 text-warning-600 dark:bg-warning-50/10 dark:text-warning-400 border border-warning-100 dark:border-warning-500/20',
    danger: 'bg-danger-50 text-danger-600 dark:bg-danger-50/10 dark:text-danger-400 border border-danger-100 dark:border-danger-500/20',
    neutral: 'bg-app-bg-secondary text-app-text-secondary border border-app-border',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const dotColors = {
    primary: 'bg-primary-500',
    secondary: 'bg-secondary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    neutral: 'bg-app-text-secondary',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
};
