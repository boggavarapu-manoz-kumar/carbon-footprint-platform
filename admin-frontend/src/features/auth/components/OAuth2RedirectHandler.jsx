import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../core/AuthContext';
import { AlertCircle } from 'lucide-react';

export const OAuth2RedirectHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const processed = useRef(false);
  const [error, setError] = React.useState(null);

  useEffect(() => {
    const handleRedirect = async () => {
      if (processed.current) return;
      processed.current = true;
      
      const token = searchParams.get('token');
      
      if (token) {
        try {
          // login function in AuthContext just updates the state with the token
          login(token);
          // Once role is fetched in AuthContext, Login page or ProtectedRoute takes over
          // Let's redirect to root to let the app route us
          navigate('/', { replace: true });
        } catch (err) {
          console.error("Failed to process OAuth token:", err);
          setError('Failed to process authentication token.');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        }
      } else {
        const urlError = searchParams.get('error');
        if (urlError) {
          setError(`Authentication failed: ${urlError}`);
        } else {
          setError('Authentication failed. No token received.');
        }
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    handleRedirect();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
        {error ? (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Authentication Error</h3>
            <p className="text-sm text-gray-500 text-center mb-6">{error}</p>
            <p className="text-xs text-gray-400">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4"></div>
            <h3 className="text-lg font-bold text-gray-900">Authenticating...</h3>
            <p className="text-sm text-gray-500 mt-2">Please wait while we log you in securely.</p>
          </>
        )}
      </div>
    </div>
  );
};
