package com.carbonfootprint.chatbot;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatHistoryService {

    private final ChatHistoryRepository chatHistoryRepository;

    /**
     * Retrieves the last N messages for the user.
     * Reverses the list so chronological order is maintained (oldest to newest).
     */
    public List<ChatHistory> getRecentHistory(String userEmail, int limit) {
        List<ChatHistory> history = chatHistoryRepository.findRecentMessages(userEmail, PageRequest.of(0, limit));
        Collections.reverse(history);
        return history;
    }

    public void saveUserMessage(String userEmail, String content) {
        saveMessage(userEmail, "user", content);
    }

    public void saveAssistantMessage(String userEmail, String content) {
        saveMessage(userEmail, "assistant", content);
    }

    private void saveMessage(String userEmail, String role, String content) {
        try {
            chatHistoryRepository.save(ChatHistory.builder()
                    .userEmail(userEmail)
                    .role(role)
                    .content(content)
                    .build());
        } catch (Exception e) {
            log.error("Failed to save chat history for user: {}", userEmail, e);
        }
    }

    @Transactional
    public void deleteUserHistory(String userEmail) {
        try {
            chatHistoryRepository.deleteByUserEmail(userEmail);
        } catch (Exception e) {
            log.error("Failed to delete chat history for user: {}", userEmail, e);
        }
    }
}
