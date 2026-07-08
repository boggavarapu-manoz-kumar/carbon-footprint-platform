import { adminAxios } from '../../../core/api';

export const analyticsApi = {
  getUserGrowth: async (days = 30) => {
    const response = await adminAxios.get('/analytics/users/growth', { params: { days } });
    return response.data.data;
  },
  
  getActivityTrends: async (days = 30) => {
    const response = await adminAxios.get('/analytics/activities/trends', { params: { days } });
    return response.data.data;
  },

  getCategoryAnalytics: async () => {
    const response = await adminAxios.get('/analytics/categories');
    return response.data.data;
  }
};
