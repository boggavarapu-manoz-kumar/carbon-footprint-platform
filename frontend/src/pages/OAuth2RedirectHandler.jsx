import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import AuthService from '../services/AuthService';

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setIsAuthenticated, fetchUser } = useAuth();

  useEffect(() => {
    const handleRedirect = async () => {
      const token = searchParams.get('token');
      // The backend currently only returns the access token via query param
      
      if (token) {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
        
        try {
          await fetchUser();
          toast.success('Successfully logged in with Google!');
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error("Failed to fetch user after OAuth:", error);
          toast.error('Failed to load user profile. Please try again.');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          navigate('/login', { replace: true });
        }
      } else {
        const error = searchParams.get('error');
        if (error) {
          toast.error(`Authentication failed: ${error}`);
        } else {
          toast.error('Authentication failed. No token received.');
        }
        navigate('/login', { replace: true });
      }
    };

    handleRedirect();
  }, [searchParams, navigate, setIsAuthenticated, fetchUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBFC]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
        <p className="text-slate-600 font-medium">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuth2RedirectHandler;
