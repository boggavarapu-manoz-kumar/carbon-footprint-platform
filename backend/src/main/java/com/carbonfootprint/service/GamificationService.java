package com.carbonfootprint.service;

import com.carbonfootprint.event.GamificationEvent;

public interface GamificationService {
    void handleGamificationEvent(GamificationEvent event);
    
    /**
     * Award XP and Points when a badge is unlocked
     */
    void awardBadgePointsAndXP(com.carbonfootprint.entity.User user, com.carbonfootprint.entity.Badge badge);
    
    /**
     * Get user's current points and level
     */
    com.carbonfootprint.dto.UserPointsResponseDto getUserPoints(Long userId);
    
    /**
     * Get user's paginated point history
     */
    org.springframework.data.domain.Page<com.carbonfootprint.dto.PointHistoryDto> getUserPointHistory(Long userId, org.springframework.data.domain.Pageable pageable);
}
