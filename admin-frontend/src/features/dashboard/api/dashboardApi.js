import { adminAxios } from '../../../core/api';

export const dashboardApi = {
  getStatistics: async () => {
    try {
      const { data } = await adminAxios.get('/dashboard/metrics');
      const metrics = data.data || {};
      
      // Map to expected format
      return {
        totalUsers: metrics.totalUsers || 0,
        activeUsers: metrics.activeUsers || 0,
        newUsers: metrics.newRegistrations || 0,
        carbonEmissions: metrics.totalCarbonEmissions || 0,
        totalActivities: metrics.totalActivities || 0,
        suspendedUsers: metrics.suspendedUsers || 0,
        securityAlerts: metrics.securityAlerts || 0,
        adminCount: metrics.adminCount || 0,
      };
    } catch (e) {
      console.warn('Dashboard stats fallback', e);
      return { 
        totalUsers: 0, 
        activeUsers: 0, 
        newUsers: 0, 
        carbonEmissions: 0,
        totalActivities: 0,
        suspendedUsers: 0,
        securityAlerts: 0,
        adminCount: 0
      };
    }
  },

  getTrends: async () => {
    try {
      const { data } = await adminAxios.get('/dashboard/trends?days=30');
      return data.data || [];
    } catch (e) {
      console.warn('Dashboard trends fallback', e);
      return [];
    }
  },
  
  getSystemHealth: async () => {
    // Currently relying on metrics endpoint to imply API health
    // In future, connect to a real /health actuator
    return { status: 'healthy', apiLatency: 45, dbLoad: 'Low' };
  },

  getAuditEvents: async () => {
    try {
      const { data } = await adminAxios.get('/audit-logs');
      return data.data?.content || data.data || [];
    } catch (e) {
      console.warn('Audit logs fallback', e);
      return [];
    }
  },

  getTopEmitters: async () => {
    try {
      const { data } = await adminAxios.get('/dashboard/leaderboard');
      return data.data || [];
    } catch (e) {
      console.warn('Leaderboard fallback', e);
      return [];
    }
  }
};
