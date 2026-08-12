import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../api/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const token = searchParams.get('token');
  const type = searchParams.get('type') || 'employee'; // admin or employee

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
      
      // Wait a moment then redirect to login
      setTimeout(() => {
        navigate('/login', { state: { message: 'Account activated. Please log in with your new password.' } });
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to activate account. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-4 border border-slate-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Activation Successful!</h2>
          <p className="text-slate-500">Your account has been activated and your password is set. Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            {type === 'admin' ? 'Organization Admin Setup' : 'Join Organization'}
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Please complete your profile to activate your account.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="John"
                disabled={loading || !token}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Doe"
                disabled={loading || !token}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
              disabled={loading || !token}
            />
            <p className="mt-1 text-xs text-slate-500">Must be at least 8 characters long.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="••••••••"
              disabled={loading || !token}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full mt-6 bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Activating...
              </>
            ) : (
              'Activate Account'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvitation;
