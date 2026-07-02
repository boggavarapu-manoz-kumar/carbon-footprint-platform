import api from '../api/axiosConfig';

const AuthService = {
  login: async (credentials) => {
    const response = await api.post('/v1/auth/authenticate', credentials);
    if (response.data && response.data.data && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data.data;
  },

  register: async (userData) => {
    const response = await api.post('/v1/auth/register', userData);
    return response.data.data;
  },

  logout: () => {
    localStorage.removeItem('token');
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
  }
};

export default AuthService;
