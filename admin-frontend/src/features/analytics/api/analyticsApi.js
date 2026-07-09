import { adminAxios } from '../../../core/api';

const currentYear = new Date().getFullYear();

export const analyticsApi = {
  // Platform Summary
  getPlatformAnalytics: async () => {
    const res = await adminAxios.get('/analytics/platform');
    return res.data.data;
  },

  // User Analytics
  getUserGrowth: async (days = 30) => {
    const res = await adminAxios.get('/analytics/users/growth', { params: { days } });
    return res.data.data;
  },
  getUserDemographics: async () => {
    const res = await adminAxios.get('/analytics/users/demographics');
    return res.data.data;
  },
  getUserMonthlyGrowth: async (year = currentYear) => {
    const res = await adminAxios.get('/analytics/users/monthly', { params: { year } });
    return res.data.data;
  },

  // Activity Analytics
  getActivityTrends: async (days = 30) => {
    const res = await adminAxios.get('/analytics/activities/trends', { params: { days } });
    return res.data.data;
  },
  getActivityAnalytics: async () => {
    const res = await adminAxios.get('/analytics/activities/details');
    return res.data.data;
  },

  // Category
  getCategoryAnalytics: async () => {
    const res = await adminAxios.get('/analytics/categories');
    return res.data.data;
  },

  // Carbon Analytics
  getCarbonTrends: async (days = 30) => {
    const res = await adminAxios.get('/analytics/carbon/trends', { params: { days } });
    return res.data.data;
  },
  getCarbonMonthlyTrends: async (year = currentYear) => {
    const res = await adminAxios.get('/analytics/carbon/monthly', { params: { year } });
    return res.data.data;
  },

  // Leaderboard
  getLeaderboardAnalytics: async (limit = 20) => {
    const res = await adminAxios.get('/analytics/leaderboard', { params: { limit } });
    return res.data.data;
  },

  // Trend Comparison
  getTrendComparison: async () => {
    const res = await adminAxios.get('/analytics/trends/comparison');
    return res.data.data;
  },

  // Daily Platform Analytics
  getDailyAnalytics: async () => {
    const res = await adminAxios.get('/analytics/daily');
    return res.data.data;
  },

  // Weekly Platform Analytics
  getWeeklyAnalytics: async () => {
    const res = await adminAxios.get('/analytics/weekly');
    return res.data.data;
  },
};
