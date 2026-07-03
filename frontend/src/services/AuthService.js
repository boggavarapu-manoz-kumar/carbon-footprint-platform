import api from '../api/axiosConfig';

const AuthService = {
  login: async (credentials) => {
    const response = await api.post('/v1/auth/authenticate', credentials);
    const token = response.data?.data?.accessToken || response.data?.data?.token;
    if (token) {
      localStorage.setItem('token', token);
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
  },

  getCurrentUser: () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      // Decode JWT payload (base64)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      const email = decoded.sub || '';
      // Extract a friendly name from the email (e.g., john.doe@email.com -> John Doe)
      const namePart = email.split('@')[0];
      const name = namePart.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
      
      return { email, name };
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
};

export default AuthService;
