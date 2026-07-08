import { adminAxios } from '../../../core/api';

export const auditApi = {
  getLogs: async ({ search = '', page = 0, size = 20, sortBy = 'timestamp', direction = 'desc' } = {}) => {
    const { data } = await adminAxios.get('/audit-logs', {
      params: { search: search || undefined, page, size, sortBy, direction },
    });
    return data.data || { content: [], totalElements: 0, totalPages: 0, number: 0, size };
  },

  exportLogs: async (params) => {
    const response = await adminAxios.get('/audit-logs/export', { 
      params,
      responseType: 'blob' 
    });
    return response.data;
  }
};
