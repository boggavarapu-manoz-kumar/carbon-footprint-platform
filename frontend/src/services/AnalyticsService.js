import api from '../api/axiosConfig';

const AnalyticsService = {
  getDailyAnalytics: async (date, category) => {
    const params = {};
    if (date) params.date = date;
    if (category) params.category = category;
    const response = await api.get('/v1/analytics/daily', { params });
    return response.data.data;
  },

  getWeeklyAnalytics: async (date, category) => {
    const params = {};
    if (date) params.date = date;
    if (category) params.category = category;
    const response = await api.get('/v1/analytics/weekly', { params });
    return response.data.data;
  },

  getMonthlyAnalytics: async (date, category) => {
    const params = {};
    if (date) params.date = date;
    if (category) params.category = category;
    const response = await api.get('/v1/analytics/monthly', { params });
    return response.data.data;
  },

  getYearlyAnalytics: async (year, category) => {
    const params = {};
    if (year) params.year = year;
    if (category) params.category = category;
    const response = await api.get('/v1/analytics/yearly', { params });
    return response.data.data;
  },

  getAvailableYears: async () => {
    const response = await api.get('/v1/analytics/years');
    return response.data.data;
  }
};

export default AnalyticsService;
