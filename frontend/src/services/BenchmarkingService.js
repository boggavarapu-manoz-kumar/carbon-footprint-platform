import api from './api';

const BenchmarkingService = {
  getMonthlyBenchmarking: async () => {
    const response = await api.get('/benchmarking/compare/monthly');
    return response.data;
  },

  getYearlyBenchmarking: async () => {
    const response = await api.get('/benchmarking/compare/yearly');
    return response.data;
  },

  getComprehensiveDashboard: async () => {
    const response = await api.get('/benchmarking/dashboard');
    return response.data;
  }
};

export default BenchmarkingService;
