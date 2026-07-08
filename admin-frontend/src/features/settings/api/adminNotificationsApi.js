import { adminAxios } from '../../../core/api';

export const adminNotificationsApi = {
  /**
   * Fetch all notifications for the current admin from the real database.
   */
  getNotifications: async () => {
    const { data } = await adminAxios.get('/notifications');
    return data.data || [];
  },

  /**
   * Mark a single notification as read.
   */
  markAsRead: async (id) => {
    const { data } = await adminAxios.patch(`/notifications/${id}/read`);
    return data;
  },

  /**
   * Mark ALL notifications as read.
   */
  markAllAsRead: async () => {
    const { data } = await adminAxios.patch('/notifications/read-all');
    return data;
  },
};
