import { adminAxios } from '../../../core/api';

const ActivityMonitorApi = {
  getMonitoringActivities: async (filter, page = 0, size = 20) => {
    const response = await adminAxios.post('/activities/monitor', filter, {
      params: { page, size }
    });
    return response.data.data;
  },
  getActivityDetails: async (id, type) => {
    const response = await adminAxios.get(`/activities/monitor/${id}`, {
      params: { type }
    });
    return response.data.data;
  }
};

export default ActivityMonitorApi;
