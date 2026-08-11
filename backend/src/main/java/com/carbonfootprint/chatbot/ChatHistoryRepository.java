package com.carbonfootprint.chatbot;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {
    
    @Query("SELECT c FROM ChatHistory c WHERE c.userEmail = :userEmail ORDER BY c.createdAt DESC")
    List<ChatHistory> findRecentMessages(String userEmail, Pageable pageable);
    
    void deleteByUserEmail(String userEmail);
}
