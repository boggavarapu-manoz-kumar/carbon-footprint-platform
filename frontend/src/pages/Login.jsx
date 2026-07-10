import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, ArrowRight } from 'lucide-react';
import { FadeIn } from '../components/motion/FadeIn';
import { StaggerReveal } from '../components/motion/StaggerReveal';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {
      setAuthError('');
      setLoading(true);
      await login(data);
      navigate('/dashboard');
    } catch (err) {
      if (err.response) {
        if (err.response.status === 403 && err.response.data?.data) {
          // This is a suspension
          navigate('/suspended', { state: { suspension: err.response.data.data } });
          return;
        }
        setAuthError(err.response.data?.message || 'Invalid credentials. Please try again.');
      } else {
        setAuthError(err.message || 'Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const hostname = window.location.hostname;
    const apiUrl = import.meta.env.VITE_API_URL || `http://${hostname}:8081/api`;
    const baseUrl = apiUrl.replace(/\/api$/, '') || `http://${hostname}:8081`;
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  };

  const handleGithubLogin = () => {
    // Placeholder for GitHub OAuth (as requested by user requirements)
    console.log('GitHub login clicked');
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-slate-900">
      
      {/* Left Side: Product Illustration & Benefits */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 lg:p-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-900/30 to-slate-900/90 mix-blend-multiply"></div>
          {/* Subtle grid */}
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        </div>

        <div className="relative z-10">
          <RouterLink to="/" className="flex items-center gap-2 mb-16 group">
            <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center backdrop-blur-sm group-hover:scale-105 transition-all">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">CarbonSync</span>
          </RouterLink>

          <StaggerReveal staggerDelay={0.1}>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              Welcome back to <br />
              <span className="text-emerald-400">intelligent sustainability.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md leading-relaxed">
              Continue managing your carbon footprint with enterprise-grade analytics, seamless integrations, and real-time insights.
            </p>
          </StaggerReveal>
        </div>

        <div className="relative z-10 mt-auto">
          <FadeIn delay={0.4}>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex-shrink-0 border border-slate-700"></div>
                <div>
                  <p className="text-slate-200 text-sm italic mb-3">"CarbonSync completely transformed how our team tracks and reports Scope 1, 2, and 3 emissions. The automated intelligence is unmatched."</p>
                  <p className="text-white font-semibold text-sm">Elena Rodriguez</p>
                  <p className="text-slate-400 text-xs">Sustainability Director, GlobalTech</p>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md">
          <FadeIn direction="none" duration={0.6}>
            <div className="mb-10 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Sign In</h2>
              <p className="text-slate-500">Enter your credentials to access your dashboard.</p>
            </div>

            <AnimatePresence>
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {authError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              
              <div className="space-y-1">
                <label htmlFor="loginIdentifier" className="block text-sm font-semibold text-slate-700">Email or Username</label>
                <input
                  id="loginIdentifier"
                  type="text"
                  placeholder="name@company.com"
                  className={`w-full px-4 py-3 bg-white border ${errors.loginIdentifier ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'} rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400`}
                  {...register('loginIdentifier', {
                    required: 'Email or Username is required'
                  })}
                />
                <AnimatePresence>
                  {errors.loginIdentifier && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm text-red-500 mt-1">{errors.loginIdentifier.message}</motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
                  <RouterLink to="/forgot-password" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
                    Forgot password?
                  </RouterLink>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-white border ${errors.password ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'} rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400`}
                    {...register('password', { required: 'Password is required' })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm text-red-500 mt-1">{errors.password.message}</motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">Remember me</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center group"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>

            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-3 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 hover:shadow-md transition-all group"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>
            </div>

            <p className="mt-10 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <RouterLink to="/register" className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors">
                Sign up for free
              </RouterLink>
            </p>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default Login;
