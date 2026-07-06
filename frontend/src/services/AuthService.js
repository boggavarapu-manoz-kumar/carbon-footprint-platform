import api from '../api/axiosConfig';

const AuthService = {
  login: async (credentials) => {
    const response = await api.post('/v1/auth/authenticate', credentials);
    const accessToken = response.data?.data?.accessToken;
    const refreshToken = response.data?.data?.refreshToken;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    return response.data.data;
  },

  register: async (userData) => {
    const response = await api.post('/v1/auth/register', userData);
    return response.data.data;
  },

  logout: async () => {
    try {
      await api.post('/v1/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },

  forgotPassword: async (email) => {
    const response = await api.post('/v1/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post('/v1/auth/reset-password', { token, newPassword });
    return response.data;
  },

  validateResetToken: async (token) => {
    const response = await api.get(`/v1/auth/validate-reset-token?token=${token}`);
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  refreshToken: async (token) => {
    const response = await api.post('/v1/auth/refresh-token', { refreshToken: token });
    const accessToken = response.data?.data?.accessToken;
    const newRefreshToken = response.data?.data?.refreshToken;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    return response.data.data;
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/v1/users/profile');
      return response.data.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/v1/users/profile', profileData);
    return response.data.data;
  }
};

export default AuthService;
