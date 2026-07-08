import { Navigate, Outlet } from 'react-router-dom';
import { getAccessToken } from '../core/api';
import { useAuth } from '../core/AuthContext';

export const ProtectedRoute = () => {
  const { isLoading } = useAuth();
  const token = getAccessToken();

  if (isLoading) {
    // Show a minimal loading state while silent refresh happens
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    // If not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the nested routes
  return <Outlet />;
};
