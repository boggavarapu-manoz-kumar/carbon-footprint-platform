package com.carbonfootprint.service;

import com.carbonfootprint.dto.recommendation.RecommendationResponseDto;

import com.carbonfootprint.dto.recommendation.RecommendationEffectivenessDto;

import java.util.List;

public interface RecommendationService {
    List<RecommendationResponseDto> getPersonalizedRecommendations(String userEmail);
    void adoptRecommendation(String userEmail, String recommendationText);
    List<RecommendationEffectivenessDto> trackRecommendationEffectiveness(String userEmail);
}
