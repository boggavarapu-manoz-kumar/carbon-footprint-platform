package com.carbonfootprint.controller;

import com.carbonfootprint.dto.recommendation.RecommendationResponseDto;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/personalized")
    public ResponseEntity<ApiResponse<List<RecommendationResponseDto>>> getPersonalizedRecommendations(Authentication authentication) {
        log.info("REST request to get personalized recommendations for user: {}", authentication.getName());
        List<RecommendationResponseDto> recommendations = recommendationService.getPersonalizedRecommendations(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }

    @GetMapping("/effectiveness")
    public ResponseEntity<ApiResponse<List<com.carbonfootprint.dto.recommendation.RecommendationEffectivenessDto>>> getRecommendationEffectiveness(Authentication authentication) {
        log.info("REST request to track recommendation effectiveness for user: {}", authentication.getName());
        List<com.carbonfootprint.dto.recommendation.RecommendationEffectivenessDto> effectiveness = recommendationService.trackRecommendationEffectiveness(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(effectiveness));
    }
}
