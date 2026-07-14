package com.carbonfootprint.service;

import com.carbonfootprint.dto.analytics.TopActivityDto;

import java.util.List;

public interface TopActivityDetectionService {
    List<TopActivityDto> getTopEmissionActivities(String userEmail);
}
