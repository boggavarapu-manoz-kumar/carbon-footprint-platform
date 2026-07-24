import api from '../api/axiosConfig';

const NotificationService = {
  getNotifications: async (unreadOnly = false, page = 0, size = 20) => {
    const response = await api.get('/v1/notifications', {
      params: { unreadOnly, page, size }
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/v1/notifications/unread-count');
    return response.data.count;
  },

  markAsRead: async (id) => {
    await api.put(`/v1/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    await api.put('/v1/notifications/read-all');
  }
};

export default NotificationService;
