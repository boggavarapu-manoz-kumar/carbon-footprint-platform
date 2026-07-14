package com.carbonfootprint.controller;

import com.carbonfootprint.dto.analytics.TopActivityDto;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.TopActivityDetectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Slf4j
public class TopActivityDetectionController {

    private final TopActivityDetectionService topActivityDetectionService;

    @GetMapping("/top-activities")
    public ResponseEntity<ApiResponse<List<TopActivityDto>>> getTopActivities(Authentication authentication) {
        log.info("REST request to get top emission activities for user: {}", authentication.getName());
        List<TopActivityDto> topActivities = topActivityDetectionService.getTopEmissionActivities(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(topActivities));
    }
}
