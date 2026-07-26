import api from '../api/axiosConfig';

const LeaderboardService = {
  getLeaderboard: async (category, sortBy) => {
    try {
      const params = {};
      if (category) params.category = category;
      if (sortBy) params.sortBy = sortBy;
      const response = await api.get('/v1/leaderboard', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  },

  getUserStats: async () => {
    try {
      const response = await api.get('/v1/leaderboard/user-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user leaderboard stats:', error);
      throw error;
    }
  },

  getWeeklyLeaderboard: async (weekStart, weekEnd, category, sortBy) => {
    try {
      const params = {};
      if (weekStart && weekEnd) {
        params.weekStart = weekStart;
        params.weekEnd = weekEnd;
      }
      if (category) params.category = category;
      if (sortBy) params.sortBy = sortBy;
      const response = await api.get('/v1/leaderboard/weekly', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly leaderboard:', error);
      throw error;
    }
  },

  getWeeklyLeaderboardHistory: async (weekStart, weekEnd) => {
    try {
      const response = await api.get('/v1/leaderboard/weekly/history', {
        params: { weekStart, weekEnd }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly leaderboard history:', error);
      throw error;
    }
  },

  getMonthlyLeaderboard: async (monthStart, monthEnd, category, sortBy) => {
    try {
      const params = {};
      if (monthStart && monthEnd) {
        params.monthStart = monthStart;
        params.monthEnd = monthEnd;
      }
      if (category) params.category = category;
      if (sortBy) params.sortBy = sortBy;
      const response = await api.get('/v1/leaderboard/monthly', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly leaderboard:', error);
      throw error;
    }
  },

  getMonthlyLeaderboardHistory: async (monthStart, monthEnd) => {
    try {
      const response = await api.get('/v1/leaderboard/monthly/history', {
        params: { monthStart, monthEnd }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly leaderboard history:', error);
      throw error;
    }
  },

  getYearlyLeaderboard: async (year, category, sortBy) => {
    try {
      const params = {};
      if (year) params.year = year;
      if (category) params.category = category;
      if (sortBy) params.sortBy = sortBy;
      const response = await api.get('/v1/leaderboard/yearly', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching yearly leaderboard:', error);
      throw error;
    }
  },

  getYearlyLeaderboardHistory: async (year) => {
    try {
      const response = await api.get('/v1/leaderboard/yearly/history', {
        params: { year }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching yearly leaderboard history:', error);
      throw error;
    }
  }
};

export default LeaderboardService;
