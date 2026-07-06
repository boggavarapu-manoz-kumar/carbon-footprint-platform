import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { Mail, User, Phone, Lock, Hash } from 'lucide-react';

const Register = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const navigate = useNavigate();

  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setAuthError('');
      setLoading(true);
      await AuthService.register(data);
      navigate('/login');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
    const baseUrl = apiUrl.replace(/\/api$/, '') || 'http://localhost:8081';
    window.location.href = `${baseUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4 py-12">
      {/* Background Decorative Blobs */}
      <div className="fixed top-0 left-0 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="fixed top-0 right-0 w-64 h-64 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="fixed -bottom-8 left-20 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Glassmorphism Card */}
      <div className="relative w-full max-w-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-8 z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
            <User className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create an Account</h1>
          <p className="text-sm text-slate-500 mt-2">Join us to reduce your carbon footprint</p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="mb-6 p-3 bg-red-50/50 border border-red-200 text-red-600 text-sm rounded-lg flex items-start backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {authError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* First Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="John"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/50 border ${errors.firstName ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400`}
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: { value: 2, message: 'Must be at least 2 characters' }
                  })}
                />
              </div>
              {errors.firstName && <p className="mt-1.5 text-xs text-red-500">{errors.firstName.message}</p>}
            </div>

            {/* Last Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Doe"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/50 border ${errors.lastName ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400`}
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: { value: 2, message: 'Must be at least 2 characters' }
                  })}
                />
              </div>
              {errors.lastName && <p className="mt-1.5 text-xs text-red-500">{errors.lastName.message}</p>}
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 font-semibold text-sm">@</span>
                </div>
                <input
                  type="text"
                  placeholder="john_doe"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/50 border ${errors.username ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400`}
                  {...register('username', {
                    required: 'Username is required',
                    pattern: {
                      value: /^[a-zA-Z0-9]([._](?![._])|[a-zA-Z0-9]){1,28}[a-zA-Z0-9]$/,
                      message: "3-30 chars, alphanumeric, dots, underscores"
                    }
                  })}
                />
              </div>
              {errors.username && <p className="mt-1.5 text-xs text-red-500">{errors.username.message}</p>}
            </div>

            {/* Mobile Number Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="tel"
                  placeholder="+1 234 567 8900"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/50 border ${errors.mobileNumber ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400`}
                  {...register('mobileNumber')}
                />
              </div>
            </div>

            {/* Gender Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender (for Avatar)</label>
              <select
                className={`w-full px-4 py-2.5 bg-white/50 border ${errors.gender ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} rounded-lg focus:outline-none focus:ring-2 transition-all`}
                {...register('gender')}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male (Micah Avatar)</option>
                <option value="FEMALE">Female (Lorelei Avatar)</option>
                <option value="OTHER">Other / Prefer not to say (Bot Avatar)</option>
              </select>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/50 border ${errors.email ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  })}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/50 border ${errors.password ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400`}
                  {...register('password', {
                    required: 'Password is required',
                    pattern: {
                      regexp: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/,
                      message: 'Must contain uppercase, lowercase, number, and special character'
                    },
                    minLength: {
                      value: 8,
                      message: 'Password must have at least 8 characters'
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/50 border ${errors.confirmPassword ? 'border-red-400 focus:ring-red-500' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} rounded-lg focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-primary hover:bg-primary-light text-white font-medium rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/70 text-slate-500">Or continue with</span>
          </div>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleRegister}
          type="button"
          className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-200 text-slate-700 font-medium rounded-lg shadow-sm transition-all flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </button>

        {/* Login Link */}
        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <RouterLink to="/login" className="font-medium text-primary hover:text-primary-light transition-colors">
            Sign in instead
          </RouterLink>
        </p>

      </div>
    </div>
  );
};

export default Register;
