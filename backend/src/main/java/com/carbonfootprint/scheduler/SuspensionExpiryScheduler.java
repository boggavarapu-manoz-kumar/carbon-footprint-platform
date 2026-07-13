package com.carbonfootprint.scheduler;

import com.carbonfootprint.entity.User;
import com.carbonfootprint.entity.UserSuspension;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.repository.UserSuspensionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SuspensionExpiryScheduler {

    private final UserSuspensionRepository userSuspensionRepository;
    private final UserRepository userRepository;

    /**
     * Runs every 5 minutes to check for expired suspensions.
     * Uses a cron expression for predictable scheduling.
     */
    @Scheduled(cron = "0 */5 * * * *")
    @Transactional
    public void processExpiredSuspensions() {
        log.info("Running scheduled check for expired user suspensions...");
        LocalDateTime now = LocalDateTime.now();

        List<UserSuspension> expiredSuspensions = userSuspensionRepository.findByActiveTrueAndEndDateBefore(now);

        if (expiredSuspensions.isEmpty()) {
            log.info("No expired suspensions found.");
            return;
        }

        log.info("Found {} expired suspensions. Processing...", expiredSuspensions.size());

        for (UserSuspension suspension : expiredSuspensions) {
            try {
                User user = suspension.getUser();
                
                // Mark suspension as inactive/revoked by system
                suspension.setActive(false);
                suspension.setRevokedDate(now);
                suspension.setRevokedBy("SYSTEM"); // "SYSTEM" represents SYSTEM
                userSuspensionRepository.save(suspension);

                // Restore user access
                user.setSuspended(false);
                userRepository.save(user);

                log.info("Automatically lifted suspension for user {} (ID: {})", user.getEmail(), user.getId());
            } catch (Exception e) {
                log.error("Failed to lift suspension for User ID: " + suspension.getUser().getId(), e);
            }
        }
        
        log.info("Completed processing expired suspensions.");
    }
}
