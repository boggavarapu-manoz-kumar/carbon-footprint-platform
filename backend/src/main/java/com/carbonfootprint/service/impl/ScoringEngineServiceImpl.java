package com.carbonfootprint.service.impl;

import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.PointHistoryRepository;
import com.carbonfootprint.service.ScoringEngineService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ScoringEngineServiceImpl implements ScoringEngineService {

    private final PointHistoryRepository pointHistoryRepository;

    @Override
    public Map<String, Long> calculateSustainabilityScore(User user, LocalDateTime start, LocalDateTime end) {
        
        Map<String, Long> scores = new HashMap<>();

        Long totalScore;
        if (start == null && end == null) {
            totalScore = pointHistoryRepository.getTotalPointsByUserId(user.getId());
        } else if (start != null && end != null) {
            totalScore = pointHistoryRepository.getPointsByUserIdAndDateRange(user.getId(), start, end);
        } else if (start != null) {
            totalScore = pointHistoryRepository.getPointsByUserIdSince(user.getId(), start);
        } else {
            totalScore = 0L;
        }

        if (totalScore == null) totalScore = 0L;

        // Since we moved to a single point system instead of arbitrary categories,
        // we can set the sub-scores to 0, or attempt to categorize them by reason.
        // For simplicity and backward compatibility with the UI, we place everything in totalScore,
        // and optionally leave others as 0. The UI will just show total score and empty breakdowns.
        
        scores.put("participationScore", 0L);
        scores.put("goalScore", 0L);
        scores.put("badgeScore", 0L);
        scores.put("carbonReductionScore", 0L);
        scores.put("consistencyScore", 0L);
        scores.put("improvementScore", 0L);
        scores.put("totalScore", totalScore);

        return scores;
    }
}
