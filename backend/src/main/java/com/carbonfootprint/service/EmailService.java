package com.carbonfootprint.service;

public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String token);
}
