import { adminAxios } from '../../../core/api';

export const usersApi = {
  /**
   * Fetches paginated, searchable users from the real backend.
   * Returns the full Spring Page<AdminUserResponse> shape.
   */
  getUsers: async ({ search = '', page = 0, size = 20, sortBy = 'createdAt', direction = 'desc' } = {}) => {
    const { data } = await adminAxios.get('/users', {
      params: { search: search || undefined, page, size, sortBy, direction },
    });
    // data.data is the Spring Page object: { content, totalElements, totalPages, number, size }
    return data.data || { content: [], totalElements: 0, totalPages: 0, number: 0, size };
  },

  getUserById: async (id) => {
    const { data } = await adminAxios.get(`/users/${id}`);
    return data.data;
  },

  suspendUser: async (id, payload) => {
    const { data } = await adminAxios.post(`/users/${id}/suspend`, payload);
    return data;
  },

  restoreUser: async (id) => {
    const { data } = await adminAxios.post(`/users/${id}/unsuspend`);
    return data;
  },

  updateUserStatus: async ({ id, status, reason }) => {
    const { data } = await adminAxios.patch(`/users/${id}/status`, { status, reason });
    return data;
  },

  exportUsers: async () => {
    const response = await adminAxios.get('/users/export', { responseType: 'blob' });
    return response.data;
  },
};
