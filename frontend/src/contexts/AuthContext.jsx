import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/AuthService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial auth state on mount
    const checkAuth = () => {
      const isAuth = AuthService.isAuthenticated();
      setIsAuthenticated(isAuth);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await AuthService.login(credentials);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
