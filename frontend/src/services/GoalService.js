import api from '../api/axiosConfig';
const BASE_URL = '/v1/goals';

const GoalService = {
  createGoal: async (goalData) => {
    const response = await api.post('/v1/goals', goalData);
    return response.data;
  },

  getUserGoals: async () => {
    const response = await api.get(BASE_URL);
    return response.data;
  },

  getGoalById: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  getGoalDetails: async (id) => {
    const response = await api.get(`/v1/goals/${id}`);
    return response.data;
  },

  getWeeklyProgress: async () => {
    const response = await api.get(`${BASE_URL}/weekly-progress`);
    return response.data;
  },

  getGoalPrediction: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/prediction`);
    return response.data;
  },

  getGoalAlerts: async () => {
    const response = await api.get(`${BASE_URL}/alerts`);
    return response.data;
  },

  getGoalAnalytics: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/analytics`);
    return response.data;
  },

  updateGoal: async (id, goalData) => {
    const response = await api.put(`${BASE_URL}/${id}`, goalData);
    return response.data;
  },

  changeGoalStatus: async (id, status, reason) => {
    const response = await api.patch(`${BASE_URL}/${id}/status`, { status, reason });
    return response.data;
  },

  getGoalHistory: async (id) => {
    const response = await api.get(`${BASE_URL}/${id}/history`);
    return response.data;
  },

  deleteGoal: async (id) => {
    const response = await api.delete(`${BASE_URL}/${id}`);
    return response.data;
  }
};

export default GoalService;
