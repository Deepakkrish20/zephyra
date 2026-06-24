import React from 'react';

export const Input = React.forwardRef(({
  label,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col w-full gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-app-text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-app-text-secondary pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`w-full px-3 py-2 text-sm bg-app-bg-secondary border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200
            ${Icon ? 'pl-10' : 'pl-3'}
            ${error 
              ? 'border-danger-500 focus:ring-danger-500/20 focus:border-danger-500 text-danger-900 dark:text-danger-500' 
              : 'border-app-border focus:ring-primary-500/20 focus:border-primary-500 text-app-text-primary'
            }
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-danger-500 font-medium">
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
