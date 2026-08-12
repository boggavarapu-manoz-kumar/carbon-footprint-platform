package com.carbonfootprint.service.impl;

import com.carbonfootprint.entity.EmailLog;
import com.carbonfootprint.repository.EmailLogRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailQueueProcessor {

    private final EmailLogRepository emailLogRepository;
    private final JavaMailSender mailSender;
    private final org.springframework.core.io.ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;

    @Value("${spring.mail.username:no-reply@carbonfootprint.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    @Value("${app.backend.url:http://localhost:8080}")
    private String backendUrl;

    private static final int MAX_RETRIES = 3;

    @Scheduled(fixedDelay = 5000) // Run every 5 seconds for lightning fast delivery
    public void processEmailQueue() {
        log.info("Starting EmailQueueProcessor run...");
        List<EmailLog> pendingEmails = emailLogRepository.findPendingEmails(
                Arrays.asList("QUEUED", "FAILED"), LocalDateTime.now());

        if (pendingEmails.isEmpty()) {
            return;
        }
        
        log.info("Found {} emails to process.", pendingEmails.size());

        for (EmailLog emailLog : pendingEmails) {
            // Skip FAILED emails that have reached MAX_RETRIES
            if ("FAILED".equals(emailLog.getStatus()) && emailLog.getRetryCount() >= MAX_RETRIES) {
                continue;
            }

            try {
                sendEmail(emailLog);
                emailLog.setStatus("SENT");
                emailLog.setErrorMessage(null);
                log.info("Successfully sent email to {}", emailLog.getToEmail());
            } catch (Exception e) {
                log.error("Failed to send email to {}", emailLog.getToEmail(), e);
                emailLog.setStatus("FAILED");
                emailLog.setErrorMessage(e.getMessage());
                emailLog.setRetryCount(emailLog.getRetryCount() + 1);
                
                // Exponential backoff: 5m, 15m, 45m
                long backoffMinutes = (long) Math.pow(3, emailLog.getRetryCount()) * 5;
                emailLog.setNextRetryAt(LocalDateTime.now().plusMinutes(backoffMinutes));
            } finally {
                emailLogRepository.save(emailLog);
            }
        }
    }

    private void sendEmail(EmailLog emailLog) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(emailLog.getToEmail());
        helper.setSubject(emailLog.getSubject());

        Map<String, Object> templateModel = objectMapper.readValue(emailLog.getPayloadData(), new TypeReference<Map<String, Object>>() {});
        
        // Add tracking URL to model
        if (emailLog.getTrackingId() == null) {
            emailLog.setTrackingId(UUID.randomUUID().toString());
            emailLogRepository.save(emailLog); // save quickly to get tracking ID stored
        }
        
        String trackingPixelUrl = backendUrl + "/api/track/open/" + emailLog.getTrackingId() + ".gif";
        
        // Read template
        org.springframework.core.io.Resource resource = resourceLoader.getResource("classpath:templates/" + emailLog.getTemplateName() + ".html");
        String htmlBody = org.springframework.util.StreamUtils.copyToString(resource.getInputStream(), java.nio.charset.StandardCharsets.UTF_8);

        // Replace placeholders
        for (Map.Entry<String, Object> entry : templateModel.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String replacement = entry.getValue() != null ? entry.getValue().toString() : "";
            
            // Wrap action links with click tracker
            if (placeholder.equals("{{actionLink}}") || placeholder.equals("{{resetLink}}")) {
                String encodedUrl = java.net.URLEncoder.encode(replacement, java.nio.charset.StandardCharsets.UTF_8);
                replacement = backendUrl + "/api/track/click/" + emailLog.getTrackingId() + "?url=" + encodedUrl;
            }
            
            htmlBody = htmlBody.replace(placeholder, replacement);
        }
        
        // Inject tracking pixel before closing body tag
        String pixelHtml = "<img src=\"" + trackingPixelUrl + "\" width=\"1\" height=\"1\" alt=\"\" style=\"display:none;\" />";
        if (htmlBody.contains("</body>")) {
            htmlBody = htmlBody.replace("</body>", pixelHtml + "\n</body>");
        } else {
            htmlBody += pixelHtml;
        }

        helper.setText(htmlBody, true);
        mailSender.send(message);
    }
}
