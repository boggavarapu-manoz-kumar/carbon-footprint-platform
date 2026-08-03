import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';
import ErrorState from '../components/ErrorState';
import { Calendar, Mail, Phone, User as UserIcon, Settings, Leaf, CheckCircle2, XCircle, Loader2, Camera, Trophy, TrendingUp, TrendingDown, Minus, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAvatarUrl, AVATAR_OPTIONS } from '../utils/formatters';
import PhoneInput from 'react-phone-number-input';
import LeaderboardService from '../services/LeaderboardService';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { t } = useTranslation();
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
  const [leaderboardStats, setLeaderboardStats] = useState(null);
  const [activeTab, setActiveTab] = useState('settings');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await LeaderboardService.getUserStats();
        setLeaderboardStats(stats);
      } catch (err) {
        console.error("Failed to fetch user leaderboard stats", err);
      }
    };
    if (fetchedProfile) {
      fetchStats();
    }
  }, [fetchedProfile]);

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
      toast.error(t('profile.toast_username_taken'));
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
          toast.success(t('profile.toast_update_success'));
        },
        onError: (err) => {
          console.error('Error updating profile:', err);
          const errorMessage = err.response?.data?.message || t('profile.toast_update_error');
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
          title={t('profile.error_title')}
          message={t('profile.error_subtitle')}
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
    <div className="min-h-screen bg-slate-50/50 font-sans pb-16">
      {/* Premium Hero Banner */}
      <div className="h-72 w-full relative overflow-hidden bg-emerald-900">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
        {/* Animated Orbs */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-40 -right-20 w-[30rem] h-[30rem] bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-32 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column: Avatar & User Summary */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24 self-start">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
              className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 border border-white/60"
            >
              {/* Avatar with change button */}
              <div className="flex justify-center -mt-20 md:-mt-24 mb-6">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
                  <img
                    key={liveAvatarUrl}
                    className="relative h-36 w-36 rounded-full border-4 border-white shadow-2xl object-cover bg-slate-100 transition-transform duration-500 group-hover:scale-105"
                    src={avatarLoadError ? fallbackAvatarUrl : liveAvatarUrl}
                    alt={`${profileData.firstName} Avatar`}
                    onError={() => setAvatarLoadError(true)}
                    onLoad={() => setAvatarLoadError(false)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(true)}
                    className="absolute inset-0 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
                    title="Change Avatar"
                  >
                    <Camera className="h-8 w-8 text-white drop-shadow-md" />
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAvatarPicker(true)}
                className="w-full mb-4 py-2 px-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="h-4 w-4" />
                {t('profile.change_avatar')}
              </button>

              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">{profileData.firstName} {profileData.lastName}</h1>
                <p className="text-sm font-medium text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full mt-2">
                  @{profileData.username}
                </p>
              </div>

              <div className="space-y-4 text-sm text-slate-600 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="truncate">{profileData.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{profileData.mobileNumber || t('profile.not_provided')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{t('profile.member_since')} {joinDate}</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Tabbed Content */}
          <div className="w-full lg:w-2/3 space-y-6">
            
            {/* Tab Navigation Header */}
            <div className="flex items-center gap-2 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-white/40 shadow-sm overflow-x-auto">
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100/60'
                }`}
              >
                <Settings className="w-4 h-4" /> {t('profile.account_settings')}
              </button>



              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                  activeTab === 'leaderboard'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100/60'
                }`}
              >
                <Trophy className="w-4 h-4" /> {t('profile.standing')}
              </button>
            </div>
            {activeTab === 'settings' && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 overflow-hidden"
              >
                <div className="px-10 py-8 border-b border-slate-100/50 bg-slate-50/30 flex items-center gap-4">
                  <div className="p-2.5 bg-emerald-100 rounded-xl">
                    <Settings className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">{t('profile.account_settings')}</h2>
                </div>

                <form onSubmit={handleSaveChanges} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('profile.first_name')}</label>
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
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('profile.last_name')}</label>
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
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('profile.username')}</label>
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
                        <p className="mt-1.5 text-xs text-red-500 font-medium">{t('profile.username_taken')}</p>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('profile.mobile_number')}</label>
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
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('profile.gender')}</label>
                      <select
                        name="gender"
                        value={profileData.gender}
                        onChange={handleInputChange}
                        className="block w-full rounded-xl border-slate-200 bg-slate-50 border py-3 px-4 text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                      >
                        <option value="">{t('profile.select_gender')}</option>
                        <option value="Male">{t('profile.male')}</option>
                        <option value="Female">{t('profile.female')}</option>
                        <option value="Other">{t('profile.other')}</option>
                        <option value="Prefer not to say">{t('profile.prefer_not_to_say')}</option>
                      </select>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('profile.email_address')}</label>
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
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('profile.sustainability_preferences')}</label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <Leaf className="h-4 w-4 text-emerald-500" />
                      </div>
                      <textarea
                        name="sustainabilityPreferences"
                        value={profileData.sustainabilityPreferences}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder={t('profile.sustainability_placeholder')}
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
                      {t('profile.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending || usernameAvailable === false}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-100 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                    >
                      {updateProfileMutation.isPending ? t('profile.saving_changes') : t('profile.save_changes')}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}



            {/* Leaderboard Standing Tab */}
            {activeTab === 'leaderboard' && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {leaderboardStats && (
                  <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl shadow-2xl p-8 border border-emerald-500/30 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                      <Trophy className="w-48 h-48 text-emerald-400 transform rotate-12" />
                    </div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                      <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-wide">
                        <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-yellow-400">
                          <Award className="w-7 h-7" />
                        </div>
                        {t('profile.leaderboard_performance')}
                      </h3>
                      <span className="text-xs font-bold px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {t('profile.live_standing')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
                      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                        <p className="text-xs font-bold text-emerald-300/80 uppercase tracking-wider mb-2">{t('profile.current_rank')}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-white">#{leaderboardStats.currentRank || '-'}</span>
                          {leaderboardStats.trend === 'IMPROVED' && <span className="flex items-center text-xs font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30"><TrendingUp className="w-3.5 h-3.5 mr-0.5"/> {t('profile.up')}</span>}
                          {leaderboardStats.trend === 'DROPPED' && <span className="flex items-center text-xs font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30"><TrendingDown className="w-3.5 h-3.5 mr-0.5"/> {t('profile.down')}</span>}
                        </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                        <p className="text-xs font-bold text-emerald-300/80 uppercase tracking-wider mb-2">{t('profile.best_rank')}</p>
                        <span className="text-4xl font-black text-yellow-400">#{leaderboardStats.bestRank || '-'}</span>
                      </div>

                      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t('profile.previous_rank')}</p>
                        <span className="text-3xl font-bold text-slate-300">#{leaderboardStats.previousRank || '-'}</span>
                      </div>

                      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">{t('profile.total_score')}</p>
                        <span className="text-3xl font-black text-emerald-400">{leaderboardStats.currentScore?.toLocaleString() || '0'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 relative z-10 text-sm font-semibold text-center">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span className="text-slate-400 text-xs block mb-1">{t('profile.weekly')}</span>
                        <span className="font-bold text-white text-lg">{leaderboardStats.weeklyScore?.toLocaleString() || '0'} pts</span>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span className="text-slate-400 text-xs block mb-1">{t('profile.monthly')}</span>
                        <span className="font-bold text-white text-lg">{leaderboardStats.monthlyScore?.toLocaleString() || '0'} pts</span>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span className="text-slate-400 text-xs block mb-1">{t('profile.yearly')}</span>
                        <span className="font-bold text-white text-lg">{leaderboardStats.yearlyScore?.toLocaleString() || '0'} pts</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
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
                    <h3 className="text-lg font-bold text-slate-900">{t('profile.choose_avatar_title')}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{t('profile.choose_avatar_subtitle')}</p>
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
                  {t('profile.choose_avatar_hint')}
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
