import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserService from '../services/UserService';
import toast from 'react-hot-toast';
import ErrorState from '../components/ErrorState';
import { Calendar, Mail, Phone, User as UserIcon, Settings, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, logout } = useAuth();

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (user) {
          const data = await UserService.getProfile();
          setProfileData({
            id: data.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            username: data.username || '',
            mobileNumber: data.mobileNumber || '',
            gender: data.gender || '',
            email: data.email || '',
            profilePictureUrl: data.profilePictureUrl || `https://api.dicebear.com/9.x/bottts/svg?seed=${data.username || 'User'}&backgroundColor=e2e8f0`,
            sustainabilityPreferences: data.sustainabilityPreferences || '',
            createdAt: data.createdAt || new Date().toISOString()
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await UserService.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        username: profileData.username,
        mobileNumber: profileData.mobileNumber,
        gender: profileData.gender,
        sustainabilityPreferences: profileData.sustainabilityPreferences
      });
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen font-sans text-slate-900 pb-12 pt-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen font-sans bg-slate-50 text-slate-900 pb-12 pt-8">
        <ErrorState
          title="Unable to load profile"
          message={error}
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
              <div className="flex justify-center -mt-16 mb-4">
                <img
                  className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover bg-slate-100"
                  src={profileData.profilePictureUrl}
                  alt={`${profileData.firstName} Avatar`}
                />
              </div>
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
                        required
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
                        className="pl-10 block w-full rounded-xl border-slate-200 bg-slate-50 border py-3 px-4 text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                        placeholder="john_doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-slate-400" />
                      </div>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={profileData.mobileNumber}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-xl border-slate-200 bg-slate-50 border py-3 px-4 text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                        placeholder="+1 (555) 000-0000"
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
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                  >
                    {saving ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
