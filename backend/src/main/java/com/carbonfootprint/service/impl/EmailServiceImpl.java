package com.carbonfootprint.service.impl;

import com.carbonfootprint.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final com.carbonfootprint.repository.EmailLogRepository emailLogRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    private void enqueueEmail(String toEmail, String subject, String templateName, java.util.Map<String, Object> emailData) {
        try {
            Long goalId = null;
            if (emailData != null && emailData.containsKey("goalId")) {
                Object gid = emailData.get("goalId");
                if (gid instanceof Number) {
                    goalId = ((Number) gid).longValue();
                } else if (gid instanceof String) {
                    try { goalId = Long.parseLong((String) gid); } catch (NumberFormatException ignored) {}
                }
            }
            
            String payload = emailData != null ? objectMapper.writeValueAsString(emailData) : "{}";

            com.carbonfootprint.entity.EmailLog emailLog = com.carbonfootprint.entity.EmailLog.builder()
                    .toEmail(toEmail)
                    .subject(subject)
                    .templateName(templateName)
                    .status("QUEUED")
                    .trackingId(java.util.UUID.randomUUID().toString())
                    .goalId(goalId)
                    .payloadData(payload)
                    .build();
            emailLogRepository.save(emailLog);
            log.info("Email queued successfully for {} using template {}", toEmail, templateName);
        } catch (Exception e) {
            log.error("Failed to enqueue email: {}", e.getMessage());
        }
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;
        enqueueEmail(toEmail, "Password Reset Request - Carbon Footprint Platform", "password-reset", java.util.Map.of("resetLink", resetUrl));
    }

    @Override
    public void sendGoalNotificationEmail(String toEmail, String title, java.util.Map<String, Object> emailData) {
        String subject = title + " - Carbon Footprint Platform";
        enqueueEmail(toEmail, subject, "goal-notification", emailData);
    }

    @Override
    public void sendGoalCompletedEmail(String toEmail, String title, java.util.Map<String, Object> emailData) {
        String subject = title + " - Carbon Footprint Platform";
        enqueueEmail(toEmail, subject, "goal-completed", emailData);
    }

    @Override
    public void sendGoalFailedEmail(String toEmail, String title, java.util.Map<String, Object> emailData) {
        String subject = title + " - Carbon Footprint Platform";
        enqueueEmail(toEmail, subject, "goal-failed", emailData);
    }

    @Override
    public void sendGoalCreatedEmail(String toEmail, String title, java.util.Map<String, Object> emailData) {
        String subject = title + " - Carbon Footprint Platform";
        enqueueEmail(toEmail, subject, "goal-created", emailData);
    }

    @Override
    public void sendAchievementEmail(String toEmail, String title, java.util.Map<String, Object> emailData) {
        String subject = title + " - Carbon Footprint Platform";
        enqueueEmail(toEmail, subject, "achievement-unlocked", emailData);
    }

    @Override
    public void sendSupportTicketEmail(String toEmail, String ticketNumber, String title) {
        String subject = "Support Ticket Created: " + ticketNumber;
        enqueueEmail(toEmail, subject, "support-ticket-created", java.util.Map.of("ticketNumber", ticketNumber, "title", title));
    }

    @Override
    public void sendSupportTicketUpdateEmail(String toEmail, String ticketNumber, String subject, String status, String latestReply, String ticketLink, String templateName) {
        java.util.Map<String, Object> emailData = new java.util.HashMap<>();
        emailData.put("ticketNumber", ticketNumber);
        emailData.put("subject", subject);
        emailData.put("status", status);
        emailData.put("latestReply", latestReply != null ? latestReply : "");
        emailData.put("ticketLink", ticketLink);
        
        enqueueEmail(toEmail, "Update on Support Ticket #" + ticketNumber, templateName, emailData);
    }

    @Override
    public void sendOrganizationInvitationEmail(String toEmail, String organizationName, String token) {
        String subject = "You've been invited to join " + organizationName + " on EcoTrack!";
        String activationLink = frontendUrl + "/accept-invite?token=" + token + "&type=admin";

        java.util.Map<String, Object> emailData = new java.util.HashMap<>();
        emailData.put("organizationName", organizationName);
        emailData.put("activationLink", activationLink);
        
        enqueueEmail(toEmail, subject, "organization-invitation", emailData);
    }
    
    @Override
    public void sendEmployeeInvitationEmail(String toEmail, String organizationName, String token) {
        String subject = "You've been invited to join " + organizationName + " on EcoTrack!";
        String activationLink = frontendUrl + "/accept-invite?token=" + token + "&type=employee";

        java.util.Map<String, Object> emailData = new java.util.HashMap<>();
        emailData.put("organizationName", organizationName);
        emailData.put("activationLink", activationLink);
        
        enqueueEmail(toEmail, subject, "employee-invitation", emailData);
    }
    
    @Override
    public void queueEmail(String toEmail, String subject, String body) {
        enqueueEmail(toEmail, subject, "general-notification", java.util.Map.of("body", body));
    }
}
