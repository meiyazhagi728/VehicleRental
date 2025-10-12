import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, hasAnyRole } from '../../utils/auth';

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requireApproval = false,
  fallbackPath = '/login' 
}) => {
  const { user, isAuthenticated: authState } = useSelector((state) => state.auth);
  const location = useLocation();

  // Check if user is authenticated
  if (!authState || !isAuthenticated(user)) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRoles.length > 0 && !hasAnyRole(user, requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if vendor approval is required
  if (requireApproval && user.role === 'vendor' && !user.isApproved) {
    return <Navigate to="/pending-approval" replace />;
  }

  return children;
};

export default ProtectedRoute;
