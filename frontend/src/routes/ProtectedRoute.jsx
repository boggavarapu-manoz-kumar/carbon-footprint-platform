import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FBFBFC]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  // Consider profile complete if they have a non-temp username and a mobile number
  const isProfileComplete = !!user?.username && !user?.username.startsWith('temp_') && !!user?.mobileNumber;

  // Force incomplete profiles to /complete-profile
  if (!isSuperAdmin && !isProfileComplete && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" replace />;
  }

  // Prevent users who have completed their profile from returning to /complete-profile
  if (!isSuperAdmin && isProfileComplete && location.pathname === '/complete-profile') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
