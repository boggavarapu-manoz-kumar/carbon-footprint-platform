import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Image as ImageIcon } from 'lucide-react';
import AdminBadgeService from '../../services/AdminBadgeService';
import toast from 'react-hot-toast';

const AdminBadgeForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ruleType: 'STREAK',
    ruleTarget: 7,
    criteria: '',
    points: 0,
    category: 'Activity',
    difficulty: 'Bronze',
    badgeType: 'Standard',
    visibility: 'PUBLIC',
    color: '#059669',
    icon: 'fa-medal',
    imageUrl: ''
  });

  useEffect(() => {
    if (isEditing) {
      fetchBadge();
    }
  }, [id]);

  const fetchBadge = async () => {
    try {
      // AdminBadgeService doesn't have getById, so we get all and filter
      // Or we can add getById. Let's just fetch all and find it
      const response = await AdminBadgeService.getAllBadges();
      const badge = response.data.find(b => b.id === parseInt(id));
      if (badge) {
        setFormData({
          name: badge.name || '',
          description: badge.description || '',
          ruleType: badge.ruleType || 'STREAK',
          ruleTarget: badge.ruleTarget || 0,
          criteria: badge.criteria || '',
          points: badge.points || 0,
          category: badge.category || 'Activity',
          difficulty: badge.difficulty || 'Bronze',
          badgeType: badge.badgeType || 'Standard',
          visibility: badge.visibility || 'PUBLIC',
          color: badge.color || '#059669',
          icon: badge.icon || 'fa-medal',
          imageUrl: badge.imageUrl || ''
        });
        if (badge.imageUrl) {
          setPreviewImage(badge.imageUrl.startsWith('http') || badge.imageUrl.startsWith('data:') ? badge.imageUrl : `http://localhost:8080${badge.imageUrl}`);
        }
      }
    } catch (error) {
      toast.error('Failed to load badge details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/png', 'image/svg+xml', 'image/webp', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Only PNG, SVG, WEBP, and JPEG files are allowed');
      return;
    }

    try {
      const response = await AdminBadgeService.uploadImage(file);
      const url = response.data;
      setFormData(prev => ({ ...prev, imageUrl: url }));
      setPreviewImage(url.startsWith('http') ? url : `http://localhost:8080${url}`);
      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        await AdminBadgeService.updateBadge(id, formData);
        toast.success('Badge updated successfully');
      } else {
        await AdminBadgeService.createBadge(formData);
        toast.success('Badge created successfully');
      }
      navigate('/admin/badges');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save badge');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/badges')} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{isEditing ? 'Edit Badge' : 'Create New Badge'}</h1>
            <p className="text-sm text-slate-500">Configure badge details, rules, and appearance</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-8 space-y-8">
          
          {/* General Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Badge Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" placeholder="e.g. Eco Warrior" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-white">
                  <option value="Activity">Activity Logging</option>
                  <option value="Streak">Streaks</option>
                  <option value="Goal">Goals</option>
                  <option value="Community">Community</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" placeholder="Description visible to users..."></textarea>
              </div>
            </div>
          </div>

          {/* Gamification Rules */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Gamification Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Rule Type *</label>
                <select name="ruleType" value={formData.ruleType} onChange={handleChange} required className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-white">
                  <option value="STREAK">Streak (Days)</option>
                  <option value="ACTIVITY_COUNT">Activities Logged</option>
                  <option value="GOAL_COMPLETED">Goals Completed</option>
                  <option value="CARBON_REDUCED">Carbon Reduced (kg)</option>
                  <option value="RECOMMENDATION_FOLLOWED">Recommendations Followed</option>
                  <option value="LEADERBOARD_RANK">Leaderboard Rank</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Target Value *</label>
                <input type="number" name="ruleTarget" value={formData.ruleTarget} onChange={handleChange} required min="1" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" placeholder="e.g. 7" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Legacy Criteria Text</label>
                <input type="text" name="criteria" value={formData.criteria} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" placeholder="Optional descriptor" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Bonus Points</label>
                <input type="number" name="points" value={formData.points} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Difficulty</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-white">
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Badge Type</label>
                <select name="badgeType" value={formData.badgeType} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-white">
                  <option value="Standard">Standard</option>
                  <option value="Milestone">Milestone</option>
                  <option value="Special Event">Special Event</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Visibility</label>
                <select name="visibility" value={formData.visibility} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none bg-white">
                  <option value="PUBLIC">Public</option>
                  <option value="HIDDEN">Hidden (Secret Badge)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Appearance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Theme Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" name="color" value={formData.color} onChange={handleChange} className="w-12 h-12 rounded cursor-pointer border-0 p-0" />
                    <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none uppercase font-mono text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Fallback Icon (FontAwesome)</label>
                  <input type="text" name="icon" value={formData.icon} onChange={handleChange} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none" placeholder="e.g. fa-leaf" />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Custom Image (PNG, SVG, WEBP)</label>
                  <div className="relative">
                    <input type="file" accept=".png,.svg,.webp" onChange={handleImageUpload} className="hidden" id="badge-image-upload" />
                    <label htmlFor="badge-image-upload" className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer text-slate-600 hover:text-emerald-600 font-medium">
                      <Upload className="w-5 h-5" />
                      Upload Image
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="bg-slate-50 p-6 rounded-2xl flex flex-col items-center justify-center border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Live Preview</h4>
                <div className="w-32 h-32 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105"
                     style={{ backgroundColor: `${formData.color}20`, border: `2px solid ${formData.color}` }}>
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-20 h-20 object-contain drop-shadow-md" />
                  ) : (
                    <i className={`fa-solid ${formData.icon || 'fa-medal'} text-5xl`} style={{ color: formData.color, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}></i>
                  )}
                </div>
                <div className="mt-6 text-center">
                  <h3 className="font-bold text-slate-900 text-lg">{formData.name || 'Badge Name'}</h3>
                  <p className="text-sm text-slate-500 mt-1">{formData.difficulty} &bull; {formData.category}</p>
                  {formData.points > 0 && (
                    <span className="inline-block mt-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                      +{formData.points} pts
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/admin/badges')} className="px-5 py-2.5 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors font-medium">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm disabled:opacity-50">
            {saving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save className="w-5 h-5" />}
            {isEditing ? 'Save Changes' : 'Create Badge'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBadgeForm;
