import api from '../api/axiosConfig';

const GamificationService = {
  getCurrentPoints: async () => {
    try {
      const response = await api.get('/v1/gamification/points/current');
      return response.data.data;
    } catch (error) {
      console.error("Error fetching current points:", error);
      return { totalPoints: 0, currentLevel: "Eco Beginner" };
    }
  },

  getPointHistory: async (page = 0, size = 20) => {
    try {
      const response = await api.get(`/v1/gamification/points/history?page=${page}&size=${size}`);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching point history:", error);
      return { content: [], totalElements: 0, totalPages: 0 };
    }
  },

  getUserBadges: async () => {
    try {
      const response = await api.get('/v1/badges');
      return response.data;
    } catch (error) {
      console.error("Error fetching user badges:", error);
      return [];
    }
  },

  getBadgeShowcase: async () => {
    try {
      const response = await api.get('/v1/badges/showcase');
      return response.data;
    } catch (error) {
      console.error("Error fetching badge showcase:", error);
      return {
        earnedBadges: [],
        lockedBadges: [],
        upcomingBadges: [],
        rareBadges: [],
        legendaryBadges: []
      };
    }
  },

  getTimeline: async () => {
    try {
      const response = await api.get('/v1/gamification/timeline');
      return response.data;
    } catch (error) {
      console.error("Error fetching timeline:", error);
      return [];
    }
  }
};

export default GamificationService;
