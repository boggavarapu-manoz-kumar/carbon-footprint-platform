import api from '../api/axiosConfig';

const BASE_URL = '/v1/quick-logs';

export const quickLogApi = {
  getQuickLogs: async () => {
    const response = await api.get(BASE_URL);
    return response.data.data;
  },

  pinActivity: async (activityTypeId, dynamicInputs) => {
    const payload = { activityTypeId, dynamicInputs };
    const response = await api.post(`${BASE_URL}/pin`, payload);
    return response.data.data;
  },

  unpinActivity: async (id) => {
    const response = await api.delete(`${BASE_URL}/pin/${id}`);
    return response.data.data;
  }
};

export default quickLogApi;
