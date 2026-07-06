import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserService from '../services/UserService';
import toast from 'react-hot-toast';
import ErrorState from '../components/ErrorState';

const Profile = () => {
  const { user, logout } = useAuth();

  const [profileData, setProfileData] = useState({
    id: null,
    fullName: '',
    email: '',
    profilePictureUrl: '',
    sustainabilityPreferences: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        if (user) {
          const data = await UserService.getProfile();
          setProfileData({
            id: data.id,
            fullName: data.fullName || '',
            email: data.email || '',
            profilePictureUrl: data.profilePictureUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.fullName || 'User'}&backgroundColor=e2e8f0`,
            sustainabilityPreferences: data.sustainabilityPreferences || ''
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
        fullName: profileData.fullName,
        profilePictureUrl: profileData.profilePictureUrl,
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

  return (
    <div className="min-h-screen font-sans text-slate-900 pb-12 pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="space-y-6">

          {/* Profile Information Section */}
          <div className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-lg font-semibold leading-6 text-slate-900">Profile Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">Update your account details.</p>
            </div>

            <div className="px-6 py-6">

              <div className="flex flex-col sm:flex-row gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center sm:items-start space-y-4">
                  <div className="relative group">
                    <img
                      className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover bg-slate-100"
                      src={profileData.profilePictureUrl}
                      alt="Profile Avatar"
                    />
                  </div>
                </div>

                {/* Form Fields */}
                <form className="flex-1 space-y-6" onSubmit={handleSaveChanges}>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                      <input
                        id="fullName"
                        type="text"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2.5 sm:text-sm border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 border bg-slate-50 transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        disabled
                        value={profileData.email}
                        className="block w-full px-4 py-2.5 sm:text-sm border-slate-200 rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed border"
                      />
                      <p className="mt-1 text-xs text-slate-500">Contact support to change your email.</p>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="sustainabilityPreferences" className="block text-sm font-medium text-slate-700 mb-2">Sustainability Preferences</label>
                    <textarea
                      id="sustainabilityPreferences"
                      name="sustainabilityPreferences"
                      value={profileData.sustainabilityPreferences}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="e.g. Vegan diet, drive an EV, use renewable energy at home..."
                      className="block w-full px-4 py-2.5 sm:text-sm border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 border bg-slate-50 transition-colors"
                    />
                    <p className="mt-1 text-xs text-slate-500">Briefly describe your lifestyle choices that impact your footprint.</p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
