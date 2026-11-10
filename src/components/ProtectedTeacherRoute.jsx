// src/components/ProtectedTeacherRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useTeacherAuth } from '../contexts/TeacherAuthContext';

const ProtectedTeacherRoute = ({ children, requirePasswordChanged = true }) => {
  const { isAuthenticated, teacher, loading } = useTeacherAuth();
  const location = useLocation();

  // Still loading from localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !teacher) {
    return <Navigate to="/teacher/login" state={{ from: location }} replace />;
  }

  // Must change password (force redirect)
  if (requirePasswordChanged && teacher.mustChangePassword) {
    return <Navigate to="/teacher/change-password" replace />;
  }

  return children;
};

export default ProtectedTeacherRoute;