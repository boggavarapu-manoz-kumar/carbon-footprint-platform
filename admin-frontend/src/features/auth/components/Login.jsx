import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authApi } from '../api/authApi';
import { useAuth } from '../../../core/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { AlertCircle } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login, role } = useAuth();
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);
  const [rateLimitTimer, setRateLimitTimer] = useState(0); 
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    mode: 'onTouched', 
  });

  // Countdown effect for rate limiting
  useEffect(() => {
    let interval;
    if (rateLimitTimer > 0) {
      interval = setInterval(() => setRateLimitTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [rateLimitTimer]);

  // Navigate only after role state has been updated to prevent race conditions
  useEffect(() => {
    if (role) {
      navigate('/', { replace: true });
    }
  }, [role, navigate]);

  const handleGoogleLogin = () => {
    const hostname = window.location.hostname;
    const apiUrl = import.meta.env.VITE_API_URL || `http://${hostname}:8081/api`;
    const baseUrl = apiUrl.replace(/\/api$/, '') || `http://${hostname}:8081`;
    const redirectUri = window.location.origin;
    window.location.href = `${baseUrl}/oauth2/authorization/google?redirect_uri=${redirectUri}`;
  };

  const onSubmit = async (data) => {
    if (rateLimitTimer > 0) return;
    
    setError(null);
    try {
      let fingerprint = localStorage.getItem('deviceFingerprint');
      if (!fingerprint) {
        fingerprint = crypto.randomUUID ? crypto.randomUUID() : 'fallback-fingerprint-' + Date.now();
        localStorage.setItem('deviceFingerprint', fingerprint);
      }
      const payload = { ...data, deviceFingerprint: fingerprint };
      const response = await authApi.login(payload);
      
      // Update in-memory state. Backend handled the HttpOnly refresh cookie.
      login(response.access_token);
      // Navigation is now handled by the useEffect watching `role`
    } catch (err) {
      // Trigger denial shake
      setShake(true);
      setTimeout(() => setShake(false), 400); 

      const status = err.response?.status;
      
      if (status === 429) {
        setError('Too many attempts. Account temporarily locked.');
        setRateLimitTimer(59);
      } else if (status === 401 || status === 403) {
        setError('Invalid email or password.');
      } else {
        setError('An unexpected system error occurred.');
      }
    }
  };

  const isLocked = rateLimitTimer > 0;

  return (
    <div className={`w-full ${shake ? 'animate-shake' : ''}`}>
      <div className="flex flex-col items-center mb-10 text-center">
        {/* Crisp logo placeholder */}
        <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-6 shadow-sm ring-1 ring-gray-900/5">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h3 className="text-[26px] font-bold tracking-tight text-gray-900">Sign in</h3>
        <p className="text-[15px] text-gray-500 mt-2 font-medium">Use your administrator account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* High contrast global error banner */}
        {error && (
          <div className="rounded-md bg-[#FEF2F2] p-4 border border-[#FCA5A5]" aria-live="polite" role="alert">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" aria-hidden="true" />
              <div className="ml-3">
                <h3 className="text-[14px] font-semibold text-red-700">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <div className={`space-y-4 transition-opacity duration-300 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <Input
            id="email"
            label="Admin Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            disabled={isSubmitting || isLocked}
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Please enter a valid email format"
              }
            })}
          />

          <div className="space-y-1 relative">
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              disabled={isSubmitting || isLocked}
              {...register('password', { 
                required: 'Password is required' 
              })}
            />
          </div>
        </div>

        <div className={`flex items-center justify-between pt-1 pb-2 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer transition-colors"
              {...register('rememberMe')}
            />
            <label htmlFor="remember-me" className="ml-2 block text-[14px] text-gray-700 cursor-pointer select-none font-medium">
              Remember me
            </label>
          </div>

          <a href="#" className="text-[14px] font-semibold text-primary-600 hover:text-primary-700 transition-colors focus:outline-none focus:underline rounded">
            Forgot password?
          </a>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          isLoading={isSubmitting}
          disabled={isLocked}
        >
          {isLocked ? `Try again in ${rateLimitTimer}s` : 'Sign in to platform'}
        </Button>
      </form>

      <div className="mt-8 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleGoogleLogin}
          type="button"
          disabled={isLocked}
          className={`w-full flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all group ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </button>
      </div>

    </div>
  );
};
