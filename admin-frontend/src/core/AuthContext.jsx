import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { setAccessToken } from './api';

const AuthContext = createContext(null);
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1/admin';

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateRoleFromToken = (token) => {
    try {
      if (token) {
        const decoded = jwtDecode(token);
        // Fallback for mocked environment if role isn't in token:
        setRole(decoded.role || 'SUPER_ADMIN'); 
      } else {
        setRole(null);
      }
    } catch (e) {
      console.error('Failed to decode token', e);
      setRole(null);
    }
  };

  const attemptSilentRefresh = async () => {
    try {
      // The browser automatically attaches the HttpOnly admin_refresh_token cookie
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true });
      setAccessToken(data.access_token);
      updateRoleFromToken(data.access_token);
    } catch (err) {
      // It's normal for this to fail on first load if they aren't logged in
      console.log("Silent refresh failed on load. User is unauthenticated.");
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial check - No localStorage! Rely completely on the silent refresh
    attemptSilentRefresh();
  }, []);

  // Utility to handle login
  const login = (token) => {
    setAccessToken(token);
    updateRoleFromToken(token);
  };

  const logout = async () => {
    try {
      // Tell backend to clear the HttpOnly cookie
      await axios.post(`${BASE_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (e) {
      console.warn("Logout request failed, clearing local state anyway.", e);
    }
    // Clear memory
    setAccessToken(null);
    setRole(null);
  };

  const hasRole = (allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(role);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-sm font-medium text-gray-500">Establishing secure session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ role, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
