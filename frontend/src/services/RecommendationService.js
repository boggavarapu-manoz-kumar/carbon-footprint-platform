import api from '../api/axiosConfig';

const RecommendationService = {
  getPersonalizedRecommendations: async () => {
    const response = await api.get('/v1/recommendations/personalized');
    return response.data.data;
  },
  
  getRecommendationEffectiveness: async () => {
    const response = await api.get('/v1/recommendations/effectiveness');
    return response.data.data;
  }
};

export default RecommendationService;
