import { adminAxios } from '../../../core/api';

const BASE_URL = '/suspensions';

export const suspensionsApi = {
  getGlobalSuspensions: async (params) => {
    const response = await adminAxios.get(BASE_URL, { params });
    return response.data.data;
  },

  bulkSuspend: async (payload) => {
    const response = await adminAxios.post(`${BASE_URL}/bulk-suspend`, payload);
    return response.data;
  },

  exportSuspensions: async () => {
    const response = await adminAxios.get(`${BASE_URL}/export`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getSuspensionHistory: async (userId) => {
    const response = await adminAxios.get(`/users/${userId}/suspensions`);
    return response.data.data;
  }
};
