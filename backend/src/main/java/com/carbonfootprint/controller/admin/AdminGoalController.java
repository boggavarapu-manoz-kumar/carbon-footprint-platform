package com.carbonfootprint.controller.admin;

import com.carbonfootprint.entity.Goal;
import com.carbonfootprint.entity.EmailLog;
import com.carbonfootprint.entity.Notification;
import com.carbonfootprint.repository.GoalRepository;
import com.carbonfootprint.repository.EmailLogRepository;
import com.carbonfootprint.repository.NotificationRepository;
import com.carbonfootprint.service.EmailService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/admin/goals")
@RequiredArgsConstructor
@Slf4j
public class AdminGoalController {

    private final GoalRepository goalRepository;
    private final EmailLogRepository emailLogRepository;
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @GetMapping("/metrics")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'AUDITOR')")
    public ResponseEntity<Map<String, Object>> getGoalMetrics() {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);
        LocalDate today = LocalDate.now();
        LocalDate nextWeek = today.plusDays(7);

        Long createdToday = goalRepository.countCreatedToday(startOfDay, endOfDay);
        Long completed = goalRepository.countTotalCompleted();
        Long failed = goalRepository.countTotalFailed();
        Long nearDeadline = goalRepository.countNearDeadline(today, nextWeek);
        Long overdue = goalRepository.countOverdue(today);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("createdToday", createdToday);
        metrics.put("completed", completed);
        metrics.put("failed", failed);
        metrics.put("nearDeadline", nearDeadline);
        metrics.put("overdue", overdue);

        return ResponseEntity.ok(metrics);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'AUDITOR')")
    public ResponseEntity<Page<Goal>> getAllGoals(Pageable pageable) {
        return ResponseEntity.ok(goalRepository.findAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'AUDITOR')")
    public ResponseEntity<Goal> getGoal(@PathVariable Long id) {
        return goalRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/timeline")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'AUDITOR')")
    public ResponseEntity<List<Map<String, Object>>> getGoalTimeline(@PathVariable Long id) {
        List<Notification> notifications = notificationRepository.findByGoalIdOrderByCreatedAtDesc(id);
        List<EmailLog> emails = emailLogRepository.findByGoalIdOrderBySentAtDesc(id);

        List<Map<String, Object>> timeline = Stream.concat(
                notifications.stream().map(n -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("type", "NOTIFICATION");
                    map.put("id", n.getId());
                    map.put("title", n.getTitle());
                    map.put("description", n.getDescription());
                    map.put("status", n.isRead() ? "READ" : "UNREAD");
                    map.put("timestamp", n.getCreatedAt());
                    return map;
                }),
                emails.stream().map(e -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("type", "EMAIL");
                    map.put("id", e.getId());
                    map.put("title", e.getSubject());
                    map.put("description", "Template: " + e.getTemplateName() + " | To: " + e.getToEmail());
                    map.put("status", e.getStatus());
                    map.put("timestamp", e.getSentAt());
                    map.put("errorMessage", e.getErrorMessage());
                    map.put("opened", e.isOpened());
                    map.put("clicked", e.isClicked());
                    map.put("retryCount", e.getRetryCount());
                    return map;
                })
        )
        .sorted((a, b) -> ((LocalDateTime) b.get("timestamp")).compareTo((LocalDateTime) a.get("timestamp")))
        .collect(Collectors.toList());

        return ResponseEntity.ok(timeline);
    }

    @PostMapping("/emails/{emailId}/retry")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<Map<String, String>> retryEmail(@PathVariable Long emailId) {
        EmailLog emailLog = emailLogRepository.findById(emailId)
                .orElseThrow(() -> new RuntimeException("Email log not found"));

        if (!"FAILED".equals(emailLog.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only failed emails can be retried."));
        }

        try {
            Map<String, Object> emailData = objectMapper.readValue(emailLog.getPayloadData(), new TypeReference<Map<String, Object>>() {});
            
            String templateName = emailLog.getTemplateName();
            if ("goal-completed".equals(templateName)) {
                emailService.sendGoalCompletedEmail(emailLog.getToEmail(), emailLog.getSubject().replace(" - Carbon Footprint Platform", ""), emailData);
            } else if ("goal-failed".equals(templateName)) {
                emailService.sendGoalFailedEmail(emailLog.getToEmail(), emailLog.getSubject().replace(" - Carbon Footprint Platform", ""), emailData);
            } else if ("goal-notification".equals(templateName)) {
                emailService.sendGoalNotificationEmail(emailLog.getToEmail(), emailLog.getSubject().replace(" - Carbon Footprint Platform", ""), emailData);
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Unknown template: " + templateName));
            }
            
            // Note: send methods are async, so they will create a new EmailLog entry and won't immediately update this exact log.
            // But we can mark this original one as retried.
            emailLog.setStatus("RETRIED");
            emailLogRepository.save(emailLog);

            return ResponseEntity.ok(Map.of("message", "Email retry initiated successfully."));
        } catch (Exception e) {
            log.error("Failed to retry email", e);
            return ResponseEntity.internalServerError().body(Map.of("message", "Failed to parse email data: " + e.getMessage()));
        }
    }
}
