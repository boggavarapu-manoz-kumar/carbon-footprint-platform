import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import { User, Phone, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

const CompleteProfile = () => {
  const { register, handleSubmit, watch, formState: { errors }, setValue, clearErrors } = useForm({
    mode: 'onChange'
  });
  const navigate = useNavigate();
  const { data: userProfile, refetch } = useProfile();
  const { refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  
  const username = watch('username');
  const mobileNumber = watch('mobileNumber');

  // Pre-fill existing data from Google/OAuth or existing profile
  useEffect(() => {
    if (userProfile) {
      // Always pre-fill personal info from the profile (comes from Google for OAuth users)
      if (userProfile.firstName) setValue('firstName', userProfile.firstName);
      if (userProfile.lastName) setValue('lastName', userProfile.lastName);

      // Pre-fill other fields if they exist
      if (userProfile.username) {
        setValue('username', userProfile.username);
      } else if (userProfile.firstName) {
        // Auto-generate a sensible username suggestion from Google name
        const base = (userProfile.firstName + (userProfile.lastName ? userProfile.lastName.charAt(0) : ''))
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
        setValue('username', base);
      }
      if (userProfile.mobileNumber) setValue('mobileNumber', userProfile.mobileNumber);
      if (userProfile.gender) setValue('gender', userProfile.gender);
    }
  }, [userProfile, setValue]);

  // Username validation effect
  useEffect(() => {
    const checkAvailability = async () => {
      if (username && username.length >= 3) {
        setCheckingUsername(true);
        setUsernameSuggestions([]);
        try {
          const response = await api.get(`/v1/users/check-username?username=${username}`);
          const isAvailable = response.data.data === true;
          setUsernameAvailable(isAvailable);
          if (!isAvailable) {
             const sugRes = await api.get(`/v1/users/suggest-username?firstName=${encodeURIComponent(username)}`);
             setUsernameSuggestions(Array.isArray(sugRes.data.data) ? sugRes.data.data : []);
          }
        } catch (error) {
          console.error("Failed to check username", error);
        } finally {
          setCheckingUsername(false);
        }
      } else {
        setUsernameAvailable(null);
        setUsernameSuggestions([]);
      }
    };
    
    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const onSubmit = async (data) => {
    if (usernameAvailable === false) {
      toast.error('Please choose an available username');
      return;
    }
    
    try {
      setLoading(true);
      await api.put('/v1/users/profile', {
        firstName: data.firstName || userProfile?.firstName,
        lastName: data.lastName || userProfile?.lastName,
        username: data.username,
        mobileNumber: data.mobileNumber || null,
        gender: data.gender || null,
      });
      
      toast.success('Profile completed successfully!');
      await refetch();
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 
                  err.response?.data?.errors?.[0] || 
                  'Failed to update profile. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-emerald-600 px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500 rounded-full opacity-50 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-emerald-700 rounded-full opacity-50 blur-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Complete Profile</h2>
            <p className="mt-2 text-emerald-100 text-sm">
              Just a few more details to unlock all features.
            </p>
          </div>
        </div>

        <div className="px-6 py-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Google pre-fill notice */}
            {userProfile?.provider === 'GOOGLE' && (
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Signed in with Google</p>
                  <p className="text-xs text-slate-500">Your name has been pre-filled from your Google account.</p>
                </div>
              </div>
            )}

            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">First Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  {...register('firstName', { required: 'Required' })}
                  className={`block w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm ${errors.firstName ? 'border-red-300' : 'border-slate-200'}`}
                  placeholder="First"
                />
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  {...register('lastName')}
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm"
                  placeholder="Last"
                />
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  {...register('username', { 
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Minimum 3 characters' }
                  })}
                  className={`block w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm ${
                    errors.username ? 'border-red-300' : 
                    usernameAvailable === true ? 'border-emerald-300 bg-emerald-50/30' :
                    usernameAvailable === false ? 'border-red-300 bg-red-50/30' :
                    'border-slate-200'
                  }`}
                  placeholder="e.g. eco_warrior"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {checkingUsername ? (
                     <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                  ) : usernameAvailable === true ? (
                     <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : usernameAvailable === false ? (
                     <XCircle className="h-5 w-5 text-red-500" />
                  ) : null}
                </div>
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.username.message}</p>
              )}
              {usernameAvailable === false && !checkingUsername && usernameSuggestions.length > 0 && (
                <div className="mt-2 p-3 bg-rose-50 border border-rose-100 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-xs text-rose-600 font-medium mb-2 flex items-center">
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Username taken. Try these:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {usernameSuggestions.map(suggestion => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setValue('username', suggestion, { shouldValidate: true });
                        }}
                        className="text-xs bg-white border border-rose-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 px-2.5 py-1 rounded-full transition-colors font-medium shadow-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Number Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <div className={`pl-10 block w-full rounded-lg border transition-all ${errors.mobileNumber ? 'border-red-300 focus-within:ring-red-500' : 'border-slate-200 focus-within:ring-emerald-500 focus-within:border-emerald-500'} focus-within:ring-2`}>
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    value={mobileNumber}
                    onChange={(val) => {
                      setValue('mobileNumber', val);
                      if (val) clearErrors('mobileNumber');
                    }}
                    className="w-full py-2.5 pr-3 text-sm bg-transparent outline-none"
                    placeholder="Enter phone number"
                  />
                  {/* Register explicitly without ref spreading since PhoneInput handles state via onChange */}
                  <input 
                    type="hidden" 
                    {...register('mobileNumber', { required: 'Mobile number is required' })} 
                  />
                </div>
              </div>
              {errors.mobileNumber && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.mobileNumber.message}</p>
              )}
            </div>

            {/* Gender Field */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender <span className="text-red-500">*</span></label>
              <select
                {...register('gender', { required: 'Please select a gender' })}
                className={`block w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm bg-white ${errors.gender ? 'border-red-300' : 'border-slate-200'}`}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Prefer Not To Say</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.gender.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || usernameAvailable === false}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all transform active:scale-[0.98] mt-6
                ${loading || usernameAvailable === false 
                  ? 'bg-emerald-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-md'}`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  Saving Profile...
                </>
              ) : (
                'Save Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
