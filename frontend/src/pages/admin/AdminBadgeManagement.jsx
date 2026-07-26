import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Archive, Play, Trash2, Shield } from 'lucide-react';
import AdminBadgeService from '../../services/AdminBadgeService';
import AdminBadgeAnalytics from './AdminBadgeAnalytics';
import toast from 'react-hot-toast';
import moment from 'moment';

const AdminBadgeManagement = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await AdminBadgeService.getAllBadges();
      setBadges(response.data || []);
    } catch (error) {
      toast.error('Failed to load badges');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await AdminBadgeService.updateStatus(id, status);
      toast.success(`Badge status updated to ${status}`);
      fetchBadges();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this badge completely?')) {
      try {
        await AdminBadgeService.deleteBadge(id);
        toast.success('Badge deleted successfully');
        fetchBadges();
      } catch (error) {
        toast.error('Failed to delete badge');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-700';
      case 'DISABLED': return 'bg-rose-100 text-rose-700';
      case 'ARCHIVED': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Badge Analytics Engine */}
      <AdminBadgeAnalytics />

      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <Shield className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Badge Management</h1>
            <p className="text-sm text-slate-500">Create and manage gamification badges</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/badges/create')}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Badge
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Badge</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {badges.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    No badges found. Click "Create Badge" to add one.
                  </td>
                </tr>
              ) : (
                badges.map((badge) => (
                  <tr key={badge.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200"
                             style={{ backgroundColor: badge.color ? `${badge.color}15` : '' }}>
                          {badge.imageUrl ? (
                            <img src={badge.imageUrl.startsWith('http') || badge.imageUrl.startsWith('/') ? badge.imageUrl : `http://localhost:8080${badge.imageUrl}`} alt={badge.name} className="w-8 h-8 object-contain" />
                          ) : (
                            <i className={`fa-solid ${badge.icon || 'fa-medal'} text-2xl`} style={{ color: badge.color || '#94a3b8' }}></i>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{badge.name}</div>
                          <div className="text-sm text-slate-500">{badge.category || 'Uncategorized'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">{badge.points || 0} pts &bull; {badge.difficulty || 'Standard'}</div>
                      <div className="text-xs text-slate-500 mt-1 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded">
                        {badge.ruleType ? `${badge.ruleType.replace('_', ' ')}: ${badge.ruleTarget}` : 'No dynamic rule'}
                      </div>
                      {badge.criteria && <div className="text-xs text-slate-500 mt-1 truncate max-w-xs">{badge.criteria}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(badge.status)}`}>
                        {badge.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/admin/badges/edit/${badge.id}`)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        
                        {badge.status !== 'ACTIVE' && (
                          <button onClick={() => handleStatusChange(badge.id, 'ACTIVE')} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors tooltip" title="Enable">
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        
                        {badge.status === 'ACTIVE' && (
                          <button onClick={() => handleStatusChange(badge.id, 'DISABLED')} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors tooltip" title="Disable">
                            <span className="w-4 h-4 flex items-center justify-center font-bold">||</span>
                          </button>
                        )}
                        
                        {badge.status !== 'ARCHIVED' && (
                          <button onClick={() => handleStatusChange(badge.id, 'ARCHIVED')} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors tooltip" title="Archive">
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button onClick={() => handleDelete(badge.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBadgeManagement;
