import api from '../api/axiosConfig';

const ActivityService = {
  getDashboardStatistics: async () => {
    const response = await api.get('/v1/statistics/dashboard');
    return response.data.data;
  },

  getActivityCatalog: async () => {
    const response = await api.get('/v1/catalog');
    return response.data.data;
  },

  getActivities: async (params = {}) => {
    // page, size, sort, startDate, endDate, category
    const response = await api.get('/v1/activities', { params });
    return response.data.data;
  },

  getUnifiedActivityHistory: async (params = {}) => {
    const response = await api.get('/v1/activities/history', { params });
    return response.data.data;
  },

  createActivity: async (activityData) => {
    const response = await api.post('/v1/activities', activityData);
    return response.data.data;
  },

  updateActivity: async (id, activityData) => {
    const response = await api.put(`/v1/activities/${id}`, activityData);
    return response.data.data;
  },

  deleteActivity: async (id) => {
    const response = await api.delete(`/v1/activities/${id}`);
    return response.data.data;
  },

  getEmissionFactors: async () => {
    const response = await api.get('/v1/emission-factors', { params: { size: 100 } });
    return response.data.data.content || [];
  },

  calculateEmission: async (calculationData) => {
    const response = await api.post('/v1/activities/calculate', calculationData);
    return response.data.data;
  }
};

export default ActivityService;
