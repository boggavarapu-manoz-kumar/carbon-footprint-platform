package com.carbonfootprint.service;

public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String token);
    void sendGoalNotificationEmail(String toEmail, String title, java.util.Map<String, Object> emailData);
    void sendGoalCompletedEmail(String toEmail, String title, java.util.Map<String, Object> emailData);
    void sendGoalFailedEmail(String toEmail, String title, java.util.Map<String, Object> emailData);
    void sendGoalCreatedEmail(String toEmail, String title, java.util.Map<String, Object> emailData);
}
