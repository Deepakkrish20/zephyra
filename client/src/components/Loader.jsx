import React from 'react';

export const Loader = ({ size = 'md', color = 'primary', text = '', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  const colors = {
    primary: 'border-primary-500/20 border-t-primary-500',
    secondary: 'border-secondary-500/20 border-t-secondary-500',
    white: 'border-white/20 border-t-white',
    dark: 'border-app-text-secondary/20 border-t-app-text-primary',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`animate-spin rounded-full border-solid ${sizes[size]} ${colors[color]}`}
        role="status"
        aria-label="loading"
      />
      {text && (
        <span className="text-sm font-medium text-app-text-secondary animate-pulse">{text}</span>
      )}
    </div>
  );
};
