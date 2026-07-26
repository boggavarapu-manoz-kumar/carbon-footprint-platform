import { adminAxios } from '../../../core/api';

export const benchmarkingApi = {
  getSummary: async (year, month) => {
    const response = await adminAxios.get('/benchmarking/summary', { params: { year, month } });
    return response.data;
  },

  getDistribution: async (year, month) => {
    const response = await adminAxios.get('/benchmarking/distribution', { params: { year, month } });
    return response.data;
  },

  getTrends: async (months = 6) => {
    const response = await adminAxios.get('/benchmarking/trends', { params: { months } });
    return response.data;
  }
};
