import api from '../api/axiosConfig';

const AuthService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/v1/auth/authenticate', credentials);
      if (response.data && response.data.data && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
      }
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/v1/auth/register', userData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

export default AuthService;
