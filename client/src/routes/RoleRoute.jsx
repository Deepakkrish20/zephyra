import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  const hasRole = allowedRoles.includes(user.role);

  if (!hasRole) {
    // If user does not have required role, redirect to their home page or root
    // For developers testing roles, this helps keep page flow robust
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'delivery_agent') return <Navigate to="/delivery" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
