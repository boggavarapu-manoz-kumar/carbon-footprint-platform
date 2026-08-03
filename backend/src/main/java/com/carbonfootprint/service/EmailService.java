package com.carbonfootprint.service;

public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String token);
    void sendGoalNotificationEmail(String toEmail, String title, java.util.Map<String, Object> emailData);
    void sendGoalCompletedEmail(String toEmail, String title, java.util.Map<String, Object> emailData);
    void sendGoalFailedEmail(String toEmail, String title, java.util.Map<String, Object> emailData);
    void sendGoalCreatedEmail(String toEmail, String title, java.util.Map<String, Object> emailData);
    void sendAchievementEmail(String toEmail, String title, java.util.Map<String, Object> emailData);
    void sendSupportTicketEmail(String toEmail, String ticketNumber, String title);
    void sendSupportTicketUpdateEmail(String toEmail, String ticketNumber, String subject, String status, String latestReply, String ticketLink, String templateName);
    void queueEmail(String toEmail, String subject, String body);
}
