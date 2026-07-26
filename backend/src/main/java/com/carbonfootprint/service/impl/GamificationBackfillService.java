package com.carbonfootprint.service.impl;

import com.carbonfootprint.event.GamificationEvent;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.GoalRepository;
import com.carbonfootprint.repository.PointHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationBackfillService {

    private final ActivityLogRepository activityLogRepository;
    private final GoalRepository goalRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    @EventListener(ApplicationReadyEvent.class)
    public void backfillPointsIfEmpty() {
        if (pointHistoryRepository.count() == 0) {
            log.info("PointHistory is empty! Starting gamification point backfill for existing records...");

            long actCount = activityLogRepository.count();
            if (actCount > 0) {
                activityLogRepository.findAll().forEach(activity -> {
                    eventPublisher.publishEvent(new GamificationEvent(this, activity.getUser().getId(), GamificationEvent.EventType.ACTIVITY_LOGGED, "FIRST_ACTIVITY_LOGGED", "ACTIVITY_LOG", String.valueOf(activity.getId()), null));
                });
                log.info("Backfilled {} activity logs.", actCount);
            }

            long goalCount = goalRepository.count();
            if (goalCount > 0) {
                goalRepository.findAll().forEach(goal -> {
                    eventPublisher.publishEvent(new GamificationEvent(this, goal.getUser().getId(), GamificationEvent.EventType.GOAL_CREATED, "GOAL_CREATED", "GOAL", "goal_" + goal.getId(), null));
                    if (goal.getStatus() == com.carbonfootprint.entity.GoalStatus.ACHIEVED) {
                        eventPublisher.publishEvent(new GamificationEvent(this, goal.getUser().getId(), GamificationEvent.EventType.GOAL_COMPLETED, "GOAL_COMPLETED", "GOAL", "goal_comp_" + goal.getId(), null));
                    }
                });
                log.info("Backfilled {} goals.", goalCount);
            }
            
            log.info("Gamification point backfill complete.");
        } else {
            log.info("PointHistory already contains data. Skipping gamification backfill.");
        }
    }
}
