import api from '../api/axiosConfig';
import { savePendingActivity, getPendingActivities } from '../utils/indexedDB';
import AuthService from './AuthService';

// Simple UUID generator for idempotency keys
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const ActivityService = {
  getDashboardStatistics: async () => {
    const response = await api.get('/v1/statistics/dashboard');
    return response.data.data;
  },

  getActivityCatalog: async () => {
    const response = await api.get('/v1/catalog');
    return response.data.data;
  },

  getActivities: async (params = {}) => {
    // page, size, sort, startDate, endDate, category
    const response = await api.get('/v1/activities', { params });
    return response.data.data;
  },

  getUnifiedActivityHistory: async (params = {}) => {
    const response = await api.get('/v1/activities/history', { params });
    const serverActivities = response.data.data;
    
    try {
      const user = await AuthService.getCurrentUser();
      const pendingLocal = await getPendingActivities();
      // Filter only activities for this user
      const userPending = pendingLocal.filter(a => a.userId === user?.id).map(a => ({
        ...a,
        id: `pending-${a.idempotencyKey}`, // Fake ID for React keys
        carbonAmount: null // Server hasn't calculated yet
      }));
      
      return {
        ...serverActivities,
        content: [...userPending, ...(serverActivities.content || [])],
        totalElements: (serverActivities.totalElements || 0) + userPending.length
      };
    } catch (e) {
      console.error("Failed to fetch pending activities from IndexedDB", e);
      return serverActivities;
    }
  },

  createActivity: async (activityData) => {
    const idempotencyKey = generateUUID();
    
    if (!navigator.onLine) {
      console.log('App is offline, queueing activity for background sync.');
      const user = await AuthService.getCurrentUser();
      
      await savePendingActivity({
        ...activityData,
        idempotencyKey,
        isOffline: true,
        syncStatus: 'PENDING',
        userId: user.id
      });
      
      // Return a simulated success response so the UI updates optimistically
      return {
        ...activityData,
        id: `offline-${Date.now()}`,
        status: 'PENDING_SYNC',
        carbonAmount: 0 // Will be calculated by server upon sync
      };
    }
    
    const response = await api.post('/v1/activities', activityData, {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    });
    return response.data.data;
  },

  updateActivity: async (id, activityData) => {
    const response = await api.put(`/v1/activities/${id}`, activityData);
    return response.data.data;
  },

  deleteActivity: async (id) => {
    const response = await api.delete(`/v1/activities/${id}`);
    return response.data.data;
  },

  getEmissionFactors: async () => {
    const response = await api.get('/v1/emission-factors', { params: { size: 100 } });
    return response.data.data.content || [];
  },

  calculateEmission: async (calculationData) => {
    const response = await api.post('/v1/activities/calculate', calculationData);
    return response.data.data;
  }
};

export default ActivityService;
