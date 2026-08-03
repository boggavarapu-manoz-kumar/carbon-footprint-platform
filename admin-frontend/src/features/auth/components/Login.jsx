import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authApi } from '../api/authApi';
import { useAuth } from '../../../core/AuthContext';
import { AlertCircle, User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login, role } = useAuth();
  const [error, setError] = useState(null);
  const [shake, setShake] = useState(false);
  const [rateLimitTimer, setRateLimitTimer] = useState(0); 
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    mode: 'onTouched', 
  });

  useEffect(() => {
    let interval;
    if (rateLimitTimer > 0) {
      interval = setInterval(() => setRateLimitTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [rateLimitTimer]);

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
      
      login(response.access_token);
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 400); 

      const status = err.response?.status;
      
      if (status === 429) {
        setError('Too many attempts. Account locked.');
        setRateLimitTimer(59);
      } else if (status === 401 || status === 403) {
        setError('Invalid credentials.');
      } else {
        setError('System error. Contact engineering.');
      }
    }
  };

  const isLocked = rateLimitTimer > 0;

  // Custom modern input styling
  const getInputClasses = (inputName) => `
    w-full pl-11 pr-4 py-3.5 bg-slate-800/40 border border-slate-700/50 
    rounded-xl text-white placeholder-slate-500
    focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
    transition-all duration-300 backdrop-blur-sm shadow-inner
    ${errors[inputName] ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' : ''}
    ${focusedInput === inputName ? 'bg-slate-800/80 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : ''}
    ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  return (
    <div className={`w-full relative z-20 ${shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          50% { transform: translateX(8px); }
          75% { transform: translateX(-8px); }
        }
      `}</style>

      <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 p-8 sm:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
        
        {/* Shine highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Admin Access</h2>
          <p className="text-slate-400 text-sm font-medium">Authenticate to enter the command center</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          
          {/* Error Banner */}
          <div className={`overflow-hidden transition-all duration-300 ${error ? 'max-h-20 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
            <div className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center text-red-300 text-sm shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <AlertCircle className="w-5 h-5 mr-3 shrink-0 text-red-400" />
              <span className="font-semibold">{error}</span>
            </div>
          </div>

          <div className={`space-y-4 transition-opacity duration-300 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
            
            {/* Email Input */}
            <div className="space-y-1.5 relative">
              <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Admin Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className={`h-5 w-5 transition-colors duration-300 ${focusedInput === 'email' ? 'text-blue-400' : 'text-slate-500'}`} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@enterprise.com"
                  autoComplete="email"
                  disabled={isSubmitting || isLocked}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  className={getInputClasses('email')}
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email format"
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1 ml-1 font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between ml-1">
                <label htmlFor="password" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`h-5 w-5 transition-colors duration-300 ${focusedInput === 'password' ? 'text-blue-400' : 'text-slate-500'}`} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={isSubmitting || isLocked}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  className={getInputClasses('password')}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-blue-400 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1 ml-1 font-semibold">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className={`flex items-center pt-2 ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="relative flex items-center">
              <input 
                id="remember-me" 
                type="checkbox" 
                className="peer appearance-none w-5 h-5 border-2 border-slate-600 rounded bg-slate-900/50 checked:bg-blue-500 checked:border-blue-500 transition-colors cursor-pointer" 
                {...register('rememberMe')}
              />
              <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 5L5 9L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-slate-300 cursor-pointer hover:text-white transition-colors">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isLocked}
            className="w-full mt-6 py-3.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center group relative overflow-hidden border border-blue-400/30"
          >
            {/* Shine effect */}
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-[shine_1.5s_ease-in-out_infinite]" />
            <style>{`
              @keyframes shine {
                from { transform: translateX(-100%) skewX(-12deg); }
                to { transform: translateX(200%) skewX(-12deg); }
              }
            `}</style>
            
            {isSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isLocked ? (
              <span>System Locked ({rateLimitTimer}s)</span>
            ) : (
              <span className="flex items-center text-base">
                Authenticate <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700/50"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="px-4 bg-slate-900 text-slate-500 rounded-full">Or continue with</span>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleGoogleLogin}
            type="button"
            disabled={isLocked}
            className={`w-full flex items-center justify-center px-6 py-3 border border-slate-700/50 rounded-xl shadow-sm bg-slate-800/60 text-slate-200 font-semibold hover:bg-slate-700/80 hover:text-white transition-all duration-300 group ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <svg className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
