import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, ArrowRight, Check, Loader2 } from 'lucide-react';
import { FadeIn } from '../components/motion/FadeIn';
import { StaggerReveal } from '../components/motion/StaggerReveal';
import api from '../api/axiosConfig';

const Register = () => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  
  // Password strength state
  const password = watch("password", "");
  const username = watch("username", "");
  const firstName = watch("firstName", "");
  const lastName = watch("lastName", "");
  const [strength, setStrength] = useState(0);

  useEffect(() => {
    let currentStrength = 0;
    if (password.length >= 8) currentStrength += 25;
    if (password.match(/[A-Z]/)) currentStrength += 25;
    if (password.match(/[0-9]/)) currentStrength += 25;
    if (password.match(/[^A-Za-z0-9]/)) currentStrength += 25;
    setStrength(currentStrength);
  }, [password]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!username || username.length < 3) {
        setUsernameAvailable(null);
        setUsernameSuggestions([]);
        return;
      }
      setCheckingUsername(true);
      try {
        const res = await api.get(`/v1/users/check-username?username=${username}`);
        setUsernameAvailable(res.data.data);
        if (!res.data.data && firstName && lastName) {
          const sugRes = await api.get(`/v1/users/suggest-username?firstName=${firstName}&lastName=${lastName}`);
          setUsernameSuggestions(sugRes.data.data || []);
        } else {
          setUsernameSuggestions([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingUsername(false);
      }
    };
    const delay = setTimeout(checkUsername, 500);
    return () => clearTimeout(delay);
  }, [username, firstName, lastName]);

  const onSubmit = async (data) => {
    try {
      setAuthError('');
      setLoading(true);
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        email: data.email,
        mobileNumber: data.mobileNumber,
        gender: data.gender,
        password: data.password,
        confirmPassword: data.confirmPassword
      });
      navigate('/dashboard');
    } catch (err) {
      if (err.response) {
        setAuthError(err.response.data?.message || 'Registration failed. Please check your details.');
      } else {
        setAuthError(err.message || 'Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    const hostname = window.location.hostname;
    const apiUrl = import.meta.env.VITE_API_URL || `http://${hostname}:8081/api`;
    const baseUrl = apiUrl.replace(/\/api$/, '') || `http://${hostname}:8081`;
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  };

  const handleGithubSignup = () => {
    console.log('GitHub signup clicked');
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
              Start your journey to <br />
              <span className="text-emerald-400">Net Zero.</span>
            </h1>
            <ul className="space-y-4 text-slate-300">
              <li className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="w-4 h-4" />
                </div>
                <span>Automated emissions tracking</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="w-4 h-4" />
                </div>
                <span>AI-powered reduction recommendations</span>
              </li>
              <li className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="w-4 h-4" />
                </div>
                <span>Global compliance reporting</span>
              </li>
            </ul>
          </StaggerReveal>
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative max-h-screen overflow-y-auto">
        <div className="w-full max-w-md py-12">
          <FadeIn direction="none" duration={0.6}>
            <div className="mb-8 text-center lg:text-left">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Create an account</h2>
              <p className="text-slate-500">Join thousands of companies reducing their footprint.</p>
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="firstName" className="block text-sm font-semibold text-slate-700">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Jane"
                    className={`w-full px-4 py-3 bg-white border ${errors.firstName ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'} rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400`}
                    {...register('firstName', { required: 'Required' })}
                  />
                  {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-1">
                  <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    className={`w-full px-4 py-3 bg-white border ${errors.lastName ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'} rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400`}
                    {...register('lastName', { required: 'Required' })}
                  />
                  {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="gender" className="block text-sm font-semibold text-slate-700">Gender</label>
                <select
                  id="gender"
                  className={`w-full px-4 py-3 bg-white border ${errors.gender ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'} rounded-xl focus:outline-none focus:ring-4 transition-all`}
                  {...register('gender', { required: 'Gender is required' })}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender.message}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="username" className="block text-sm font-semibold text-slate-700">Username</label>
                <div className="relative">
                  <input
                    id="username"
                    type="text"
                    placeholder="janedoe"
                    className={`w-full px-4 py-3 bg-white border ${errors.username || usernameAvailable === false ? 'border-red-400 focus:ring-red-500' : usernameAvailable ? 'border-emerald-400 focus:ring-emerald-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'} rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400 pr-10`}
                    {...register('username', { required: 'Username is required', minLength: { value: 3, message: 'Min 3 characters' } })}
                  />
                  {checkingUsername && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
                  {!checkingUsername && usernameAvailable === true && <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />}
                </div>
                {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>}
                {!errors.username && usernameAvailable === false && (
                  <div className="mt-1">
                    <p className="text-sm text-red-500 mb-1">Username is already taken.</p>
                    {usernameSuggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {usernameSuggestions.map(s => (
                          <span 
                            key={s} 
                            onClick={() => setValue('username', s, { shouldValidate: true })}
                            className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md cursor-pointer hover:bg-emerald-100 transition-colors"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Work Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="jane@company.com"
                  className={`w-full px-4 py-3 bg-white border ${errors.email ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'} rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400`}
                  {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' } })}
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="mobileNumber" className="block text-sm font-semibold text-slate-700">Mobile Number</label>
                <input
                  id="mobileNumber"
                  type="tel"
                  placeholder="+1234567890"
                  className={`w-full px-4 py-3 bg-white border ${errors.mobileNumber ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'} rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400`}
                  {...register('mobileNumber', { required: 'Mobile Number is required', pattern: { value: /^\+?[0-9]{10,15}$/, message: 'Invalid mobile number (10-15 digits)' } })}
                />
                {errors.mobileNumber && <p className="text-sm text-red-500 mt-1">{errors.mobileNumber.message}</p>}
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-white border ${errors.password ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'} rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400`}
                    {...register('password', { 
                      required: 'Password is required', 
                      minLength: { value: 8, message: 'Must be at least 8 characters' }
                    })}
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
                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-2 flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength >= 25 ? 'w-1/4 bg-red-400' : 'w-0'}`}></div>
                    <div className={`h-full transition-all duration-300 ${strength >= 50 ? 'w-1/4 bg-amber-400' : 'w-0'}`}></div>
                    <div className={`h-full transition-all duration-300 ${strength >= 75 ? 'w-1/4 bg-emerald-400' : 'w-0'}`}></div>
                    <div className={`h-full transition-all duration-300 ${strength >= 100 ? 'w-1/4 bg-emerald-600' : 'w-0'}`}></div>
                  </div>
                )}
                <AnimatePresence>
                  {errors.password && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm text-red-500 mt-1">{errors.password.message}</motion.p>}
                </AnimatePresence>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-white border ${errors.confirmPassword ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'} rounded-xl focus:outline-none focus:ring-4 transition-all placeholder:text-slate-400`}
                    {...register('confirmPassword', { 
                      required: 'Please confirm your password', 
                      validate: val => val === password || 'Passwords do not match'
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showConfirmPassword ? (
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <div className="flex items-start">
                <input id="terms" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-600" required />
                <label htmlFor="terms" className="ml-2 block text-sm text-slate-600">
                  I agree to the <a href="#" className="text-emerald-600 hover:underline">Terms of Service</a> and <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>.
                </label>
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
                  <>Create Account <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center space-x-4">
              <span className="h-px w-full bg-slate-200"></span>
              <span className="text-sm text-slate-400 font-medium whitespace-nowrap">Or continue with</span>
              <span className="h-px w-full bg-slate-200"></span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                onClick={handleGoogleSignup}
                type="button"
                className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center active:scale-[0.98]"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>
              
              <button
                onClick={handleGithubSignup}
                type="button"
                className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center active:scale-[0.98]"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                GitHub
              </button>
            </div>

            <p className="mt-10 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <RouterLink to="/login" className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors">
                Sign in
              </RouterLink>
            </p>
          </FadeIn>
        </div>
      </div>
    </div>
  );
};

export default Register;
