import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import AuthService from '../services/AuthService';

const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthLogin } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    const handleRedirect = async () => {
      if (processed.current) return;
      processed.current = true;
      
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      
      if (token) {
        try {
          await handleOAuthLogin(token, refreshToken);
          toast.success('Successfully logged in with Google!');
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error("Failed to fetch user after OAuth:", error);
          toast.error('Failed to load user profile. Please try again.');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
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
  }, [searchParams, navigate, handleOAuthLogin]);

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
