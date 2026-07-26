import { adminAxios as api } from '../../../core/api';

export const getGoalMetrics = async () => {
  const response = await api.get('/goals/metrics');
  return response.data;
};

export const getAllGoals = async (page = 0, size = 10) => {
  const response = await api.get(`/goals?page=${page}&size=${size}&sort=createdAt,desc`);
  return response.data;
};

export const getGoalTimeline = async (id) => {
  const response = await api.get(`/goals/${id}/timeline`);
  return response.data;
};

export const retryFailedEmail = async (emailId) => {
  const response = await api.post(`/goals/emails/${emailId}/retry`);
  return response.data;
};
