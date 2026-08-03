package com.carbonfootprint.repository;

import com.carbonfootprint.entity.SupportTicket;
import com.carbonfootprint.entity.TicketFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TicketFeedbackRepository extends JpaRepository<TicketFeedback, Long> {
    Optional<TicketFeedback> findByTicket(SupportTicket ticket);
    boolean existsByTicketId(Long ticketId);
}
