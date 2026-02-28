import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If no user is logged in, redirect to appropriate login page
  if (!user) {
    const from = location.pathname;
    
    // Determine which login page to redirect to based on the route
    if (from.startsWith('/donor')) {
      return <Navigate to="/login/donor" state={{ from }} replace />;
    } else if (from.startsWith('/institution')) {
      return <Navigate to="/login/institution" state={{ from }} replace />;
    } else if (from.startsWith('/admin')) {
      return <Navigate to="/login/admin" state={{ from }} replace />;
    }
    
    return <Navigate to="/" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.type)) {
    // Redirect to appropriate dashboard based on user type
    switch (user.type) {
      case 'DONOR':
        return <Navigate to="/donor/dashboard" replace />;
      case 'INSTITUTION':
        return <Navigate to="/institution/dashboard" replace />;
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;