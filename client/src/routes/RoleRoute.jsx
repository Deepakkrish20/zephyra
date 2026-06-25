import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ROLES } from '../constants/roles';

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = allowedRoles.includes(user.role);

  if (!hasRole) {
    // If user does not have required role, redirect to their home page or root dashboard
    if (user.role === ROLES.ADMIN) return <Navigate to="/admin" replace />;
    if (user.role === ROLES.DELIVERY_AGENT) return <Navigate to="/delivery" replace />;
    return <Navigate to="/customer" replace />;
  }

  return children;
};

export default RoleRoute;
