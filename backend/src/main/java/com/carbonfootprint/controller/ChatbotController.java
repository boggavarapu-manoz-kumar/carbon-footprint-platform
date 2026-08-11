package com.carbonfootprint.controller;

import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.service.ChatbotService;
import com.carbonfootprint.chatbot.ChatHistoryService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/chatbot")
@RequiredArgsConstructor
@Slf4j
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final ChatHistoryService chatHistoryService;

    @PostMapping("/query")
    public SseEmitter queryChatbot(
            @RequestBody ChatRequest request,
            @AuthenticationPrincipal User user) {
        
        log.info("Chatbot query received from user: {}", user.getEmail());
        
        // Timeout is 30 seconds
        SseEmitter emitter = new SseEmitter(30000L);
        
        // Execute stream generation asynchronously
        new Thread(() -> {
            try {
                chatbotService.streamQuery(user, request.getQuery(), emitter);
            } catch (Exception e) {
                log.error("Streaming error", e);
                emitter.completeWithError(e);
            }
        }).start();

        return emitter;
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearHistory(@AuthenticationPrincipal User user) {
        chatHistoryService.deleteUserHistory(user.getEmail());
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class ChatRequest {
        private String query;
    }
}
