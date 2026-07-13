import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1/other-activities`,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const OtherActivityService = {
  createLog: async (data) => {
    const response = await apiClient.post('', data);
    return response.data;
  },

  getLogs: async (params = {}) => {
    const response = await apiClient.get('', { params });
    return response.data;
  },

  deleteLog: async (id) => {
    const response = await apiClient.delete(`/${id}`);
    return response.data;
  }
};

export default OtherActivityService;
