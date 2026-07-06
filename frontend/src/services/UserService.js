import api from '../api/axiosConfig';

const UserService = {
  getUserByEmail: async (email) => {
    const response = await api.get(`/v1/users/email/${email}`);
    return response.data.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/v1/users/${id}`, userData);
    return response.data.data;
  },

  getProfile: async () => {
    const response = await api.get(`/v1/users/profile`);
    return response.data.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put(`/v1/users/profile`, profileData);
    return response.data.data;
  }
};

export default UserService;
