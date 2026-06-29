import React from 'react';

export const Card = ({ children, className = '', hoverEffect = false, ...props }) => {
  return (
    <div
      className={`bg-app-bg-primary border border-app-border rounded-xl shadow-sm overflow-hidden transition-all duration-200
        ${hoverEffect ? 'hover:shadow-md hover:-translate-y-0.5 hover:border-primary-500/30' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`px-5 py-4 border-b border-app-border ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div
    className={`px-5 py-4 border-t border-app-border bg-app-bg-secondary ${className}`}
    {...props}
  >
    {children}
  </div>
);
