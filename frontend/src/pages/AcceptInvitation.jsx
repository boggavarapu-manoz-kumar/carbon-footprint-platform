import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck, User as UserIcon } from 'lucide-react';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const token = searchParams.get('token');
  const type = searchParams.get('type') || 'employee';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token.');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError(null);
    setLoading(true);
    
    try {
      const endpoint = type === 'admin' 
        ? '/v1/invitations/activate-admin' 
        : '/v1/invitations/activate-employee';
        
      await api.post(endpoint, {
        token,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      });
      
      setSuccess(true);
      toast.success('Account activated successfully!');
      
      setTimeout(() => {
        navigate('/login', { state: { message: 'Account activated. Please log in with your new password.' } });
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate account. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 focus:bg-white transition-all backdrop-blur-sm shadow-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50/50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none"></div>
      
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center space-y-6 border border-white"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Setup Complete!</h2>
            <p className="text-slate-600 text-lg">Your account has been secured. Redirecting you to the portal...</p>
            <div className="flex justify-center pt-4">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg w-full"
          >
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 p-8 sm:p-10 border border-white/50">
              
              <div className="text-center mb-10 relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 mb-6 shadow-inner border border-emerald-100">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                  {type === 'admin' ? 'Organization Admin Setup' : 'Activate Your Account'}
                </h2>
                <p className="text-slate-500 text-base max-w-sm mx-auto leading-relaxed">
                  Welcome to the platform! Please provide your details to secure your new account.
                </p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-8 p-4 bg-rose-50/80 backdrop-blur-sm text-rose-700 rounded-xl flex items-start gap-3 border border-rose-100"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
                  <p className="text-sm font-medium leading-relaxed">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text" name="firstName" required
                        value={formData.firstName} onChange={handleChange}
                        className={`${inputClasses} pl-11`} placeholder="Jane"
                        disabled={loading || !token}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                    <input
                      type="text" name="lastName" required
                      value={formData.lastName} onChange={handleChange}
                      className={inputClasses} placeholder="Doe"
                      disabled={loading || !token}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Create Password</label>
                  <input
                    type="password" name="password" required minLength={8}
                    value={formData.password} onChange={handleChange}
                    className={inputClasses} placeholder="••••••••"
                    disabled={loading || !token}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                  <input
                    type="password" name="confirmPassword" required minLength={8}
                    value={formData.confirmPassword} onChange={handleChange}
                    className={inputClasses} placeholder="••••••••"
                    disabled={loading || !token}
                  />
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full relative overflow-hidden group bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all duration-300 shadow-lg shadow-emerald-600/20 disabled:opacity-70 disabled:cursor-wait"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Securing Account...
                        </>
                      ) : (
                        <>
                          Complete Registration
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AcceptInvitation;
