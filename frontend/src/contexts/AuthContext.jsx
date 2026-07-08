import React, { createContext, useState, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import AuthService from '../services/AuthService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const userData = await AuthService.getCurrentUser();
    setUser(userData);
  };

  useEffect(() => {
    // Check initial auth state on mount
    const checkAuth = async () => {
      const isAuth = AuthService.isAuthenticated();
      setIsAuthenticated(isAuth);
      if (isAuth) {
        await fetchUser();
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    queryClient.clear(); // Clear any stale cache before logging in new user
    const data = await AuthService.login(credentials);
    setIsAuthenticated(true);
    await fetchUser();
    return data;
  };

  const handleOAuthLogin = async (token, refreshToken) => {
    queryClient.clear();
    localStorage.setItem('token', token);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    setIsAuthenticated(true);
    await fetchUser();
    // Invalidate profile cache so CompleteProfile always gets fresh data from the server
    queryClient.invalidateQueries({ queryKey: ['userProfile'] });
  };

  const register = async (userData) => {
    const data = await AuthService.register(userData);
    setIsAuthenticated(true);
    await fetchUser();
    return data;
  };

  const logout = async () => {
    await AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
    queryClient.clear(); // Clear cache so no data leaks to next user
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, handleOAuthLogin, register, logout, updateUser, refreshUser: fetchUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
