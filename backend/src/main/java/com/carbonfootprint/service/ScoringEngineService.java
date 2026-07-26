package com.carbonfootprint.service;

import com.carbonfootprint.entity.User;
import java.time.LocalDateTime;
import java.util.Map;

public interface ScoringEngineService {
    Map<String, Long> calculateSustainabilityScore(User user, LocalDateTime start, LocalDateTime end);
}
