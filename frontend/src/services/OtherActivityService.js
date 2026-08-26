import api from '../api/axiosConfig';

const OtherActivityService = {
  createLog: async (data) => {
    const response = await api.post('/v1/other-activities', data);
    return response.data;
  },

  getLogs: async (params = {}) => {
    const response = await api.get('/v1/other-activities', { params });
    return response.data;
  },

  deleteLog: async (id) => {
    const response = await api.delete(`/v1/other-activities/${id}`);
    return response.data;
  }
};

export default OtherActivityService;
