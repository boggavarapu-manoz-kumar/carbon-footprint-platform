import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import ErrorState from '../components/ErrorState';
import { Calendar, Mail, Phone, User as UserIcon, Settings, Leaf, CheckCircle2, XCircle, Loader2, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl, AVATAR_OPTIONS } from '../utils/formatters';
import PhoneInput from 'react-phone-number-input';

const Profile = () => {
  const { refreshUser } = useAuth();
  const { data: fetchedProfile, isLoading: loading, error: fetchError } = useProfile();
  const updateProfileMutation = useUpdateProfile();

  const [profileData, setProfileData] = useState({
    id: null,
    firstName: '',
    lastName: '',
    username: '',
    mobileNumber: '',
    gender: '',
    email: '',
    profilePictureUrl: '',
    sustainabilityPreferences: '',
    createdAt: ''
  });
  
  const [originalUsername, setOriginalUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const liveAvatarUrl = getAvatarUrl(profileData.profilePictureUrl);
  const fallbackAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent((profileData.firstName || 'U') + '+' + (profileData.lastName || ''))}&background=10b981&color=fff&size=128&bold=true`;

  useEffect(() => {
    if (fetchedProfile) {
      setProfileData({
        id: fetchedProfile.id,
        firstName: fetchedProfile.firstName || '',
        lastName: fetchedProfile.lastName || '',
        username: fetchedProfile.username || '',
        mobileNumber: fetchedProfile.mobileNumber || '',
        gender: fetchedProfile.gender || '',
        email: fetchedProfile.email || '',
        profilePictureUrl: fetchedProfile.profilePictureUrl || '',
        sustainabilityPreferences: fetchedProfile.sustainabilityPreferences || '',
        createdAt: fetchedProfile.createdAt || new Date().toISOString()
      });
      setOriginalUsername(fetchedProfile.username || '');
      setAvatarLoadError(false);
    }
  }, [fetchedProfile]);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!profileData.username || profileData.username.length < 3 || profileData.username === originalUsername) {
        setUsernameAvailable(null);
        return;
      }
      setCheckingUsername(true);
      try {
        const response = await api.get(`/v1/users/check-username?username=${profileData.username}`);
        setUsernameAvailable(response.data.data);
      } catch (e) {
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    };
    const timer = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timer);
  }, [profileData.username, originalUsername]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (avatarUrl) => {
    setProfileData(prev => ({ ...prev, profilePictureUrl: avatarUrl }));
    setAvatarLoadError(false);
    setShowAvatarPicker(false);
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (usernameAvailable === false) {
      toast.error('Please choose an available username.');
      return;
    }
    
    updateProfileMutation.mutate(
      {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        username: profileData.username,
        mobileNumber: profileData.mobileNumber,
        gender: profileData.gender,
        sustainabilityPreferences: profileData.sustainabilityPreferences,
        profilePictureUrl: profileData.profilePictureUrl,
      },
      {
        onSuccess: async () => {
          setOriginalUsername(profileData.username);
          setUsernameAvailable(null);
          if (refreshUser) await refreshUser();
          toast.success('Profile updated successfully!');
        },
        onError: (err) => {
          console.error('Error updating profile:', err);
          const errorMessage = err.response?.data?.message || 'Failed to update profile. Please try again.';
          toast.error(errorMessage);
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans text-slate-900 pb-12 pt-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen font-sans bg-slate-50 text-slate-900 pb-12 pt-8">
        <ErrorState
          title="Unable to load profile"
          message="Failed to load profile data."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const joinDate = new Date(profileData.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Premium Hero Banner */}
      <div className="bg-emerald-600 h-64 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Column: Avatar & Summary */}
          <div className="w-full md:w-1/3">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl p-6 border border-slate-100 sticky top-24"
            >
              {/* Avatar with change button */}
              <div className="flex justify-center -mt-16 mb-4">
                <div className="relative group">
                  <img
                    key={liveAvatarUrl}
                    className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover bg-slate-100 transition-all duration-300"
                    src={avatarLoadError ? fallbackAvatarUrl : liveAvatarUrl}
                    alt={`${profileData.firstName} Avatar`}
                    onError={() => setAvatarLoadError(true)}
                    onLoad={() => setAvatarLoadError(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(true)}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    title="Change Avatar"
                  >
                    <Camera className="h-7 w-7 text-white" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAvatarPicker(true)}
                className="w-full mb-4 py-2 px-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Change Avatar
              </button>

              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">{profileData.firstName} {profileData.lastName}</h1>
                <p className="text-sm font-medium text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full mt-2">
                  @{profileData.username}
                </p>
              </div>

              <div className="space-y-4 text-sm text-slate-600 mb-6 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{profileData.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{profileData.mobileNumber || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Member since {joinDate}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Edit Form */}
          <div className="w-full md:w-2/3">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <Settings className="h-5 w-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-800">Account Settings</h2>
              </div>

              <form onSubmit={handleSaveChanges} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-xl border-slate-200 bg-slate-50 border py-3 px-4 text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-xl border-slate-200 bg-slate-50 border py-3 px-4 text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-400 font-semibold text-sm">@</span>
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={profileData.username}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 block w-full rounded-xl border-slate-200 bg-slate-50 border py-3 px-4 text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors ${usernameAvailable === false ? 'border-red-400 focus:ring-red-500' : ''}`}
                        placeholder="john_doe"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {checkingUsername && <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />}
                        {!checkingUsername && usernameAvailable === true && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        {!checkingUsername && usernameAvailable === false && <XCircle className="h-4 w-4 text-red-500" />}
                      </div>
                    </div>
                    {usernameAvailable === false && (
                      <p className="mt-1.5 text-xs text-red-500 font-medium">This username is already taken.</p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
                    <div className="relative">
                      <PhoneInput
                        international
                        defaultCountry="US"
                        value={profileData.mobileNumber}
                        onChange={(value) => handleInputChange({ target: { name: 'mobileNumber', value: value || '' } })}
                        className="block w-full rounded-xl border-slate-200 bg-slate-50 border py-3 px-4 text-slate-900 focus-within:ring-emerald-500 focus-within:border-emerald-500 sm:text-sm transition-colors custom-phone-input"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleInputChange}
                      className="block w-full rounded-xl border-slate-200 bg-slate-50 border py-3 px-4 text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other / Prefer not to say</option>
                    </select>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <div className="relative opacity-60">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="email"
                        disabled
                        value={profileData.email}
                        className="pl-10 block w-full rounded-xl border-slate-200 bg-slate-100 border py-3 px-4 text-slate-900 sm:text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Sustainability Preferences */}
                <div className="pt-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Sustainability Preferences</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <Leaf className="h-4 w-4 text-emerald-500" />
                    </div>
                    <textarea
                      name="sustainabilityPreferences"
                      value={profileData.sustainabilityPreferences}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Share your eco-friendly lifestyle choices (e.g., Vegan diet, drive an EV, use renewable energy at home...)"
                      className="pl-10 block w-full rounded-xl border-slate-200 bg-slate-50 border py-3 px-4 text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    onClick={() => window.location.reload()}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfileMutation.isPending || usernameAvailable === false}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                  >
                    {updateProfileMutation.isPending ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowAvatarPicker(false)}
            />
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg pointer-events-auto">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Choose Your Avatar</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Pick a cartoon avatar that suits you</p>
                  </div>
                  <button
                    onClick={() => setShowAvatarPicker(false)}
                    className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-3">
                  {AVATAR_OPTIONS.map((avatar) => {
                    const isSelected = profileData.profilePictureUrl === avatar.url;
                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => handleAvatarSelect(avatar.url)}
                        className={`relative flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all hover:scale-105 active:scale-100 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
                            : 'border-slate-100 hover:border-slate-300 bg-slate-50'
                        }`}
                        title={avatar.label}
                      >
                        <img
                          src={avatar.url}
                          alt={avatar.label}
                          className="h-14 w-14 rounded-full object-cover bg-white"
                        />
                        <span className="text-[10px] font-medium text-slate-600 truncate w-full text-center">
                          {avatar.label}
                        </span>
                        {isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full p-0.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs text-slate-400 text-center mt-4">
                  Click an avatar to select it, then save your profile to apply.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
