import api from '../api/axiosConfig';

const BenchmarkingService = {
  getMonthlyBenchmarking: async () => {
    const response = await api.get('/v1/benchmarking/compare/monthly');
    return response.data;
  },

  getYearlyBenchmarking: async () => {
    const response = await api.get('/v1/benchmarking/compare/yearly');
    return response.data;
  },

  getComprehensiveDashboard: async () => {
    const response = await api.get('/v1/benchmarking/dashboard');
    return response.data;
  }
};

export default BenchmarkingService;
