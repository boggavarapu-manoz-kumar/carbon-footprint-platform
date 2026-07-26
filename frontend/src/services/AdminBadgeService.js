import api from './api';

const AdminBadgeService = {
  getAllBadges: async () => {
    const response = await api.get('/admin/badges');
    return response.data;
  },

  createBadge: async (badgeData) => {
    const response = await api.post('/admin/badges', badgeData);
    return response.data;
  },

  updateBadge: async (id, badgeData) => {
    const response = await api.put(`/admin/badges/${id}`, badgeData);
    return response.data;
  },

  deleteBadge: async (id) => {
    const response = await api.delete(`/admin/badges/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await api.patch(`/admin/badges/${id}/status`, null, { params: { status } });
    return response.data;
  },

  getBadgeAnalytics: async (year) => {
    const response = await api.get('/admin/analytics/badges', { params: { year } });
    return response.data;
  },

  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/admin/badges/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default AdminBadgeService;
