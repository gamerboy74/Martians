import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Loading } from './ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { session, isAdmin, loading, checkIsAdmin } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (session) {
      checkIsAdmin();
    }
  }, [session, checkIsAdmin]);

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!session) {
    // Save the attempted URL for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access for routes that require it
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;