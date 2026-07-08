import { adminAxios } from '../../../core/api';

export const authApi = {
  login: async (credentials) => {
    // Expected to return { accessToken, sessionId, etc. }
    // The backend will automatically set the HttpOnly admin_refresh_token cookie
    const { data } = await adminAxios.post('/auth/login', credentials);
    return data;
  },
  
  logout: async () => {
    // Backend clears the HttpOnly cookie
    await adminAxios.post('/auth/logout');
  },
};
