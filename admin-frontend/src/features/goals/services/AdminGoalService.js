import api from '../../../core/api';

export const getGoalMetrics = async () => {
  const response = await api.get('/admin/goals/metrics');
  return response.data;
};

export const getAllGoals = async (page = 0, size = 10) => {
  const response = await api.get(`/admin/goals?page=${page}&size=${size}&sort=createdAt,desc`);
  return response.data;
};

export const getGoalTimeline = async (id) => {
  const response = await api.get(`/admin/goals/${id}/timeline`);
  return response.data;
};

export const retryFailedEmail = async (emailId) => {
  const response = await api.post(`/admin/goals/emails/${emailId}/retry`);
  return response.data;
};
