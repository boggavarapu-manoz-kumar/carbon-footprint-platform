package com.carbonfootprint.controller.admin;

import com.carbonfootprint.service.impl.GoalReminderEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/reminders")
@RequiredArgsConstructor
public class GoalReminderController {

    private final GoalReminderEngine goalReminderEngine;

    @PostMapping("/trigger")
    public ResponseEntity<Map<String, String>> triggerReminders() {
        goalReminderEngine.evaluateAndSendReminders();
        
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Goal Reminder Engine triggered manually.");
        
        return ResponseEntity.ok(response);
    }
}
