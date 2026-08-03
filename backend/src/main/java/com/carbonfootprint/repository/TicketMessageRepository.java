package com.carbonfootprint.repository;

import com.carbonfootprint.entity.SupportTicket;
import com.carbonfootprint.entity.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> {
    List<TicketMessage> findByTicketOrderByCreatedAtAsc(SupportTicket ticket);
    List<TicketMessage> findByTicketAndIsInternalFalseOrderByCreatedAtAsc(SupportTicket ticket);
}
