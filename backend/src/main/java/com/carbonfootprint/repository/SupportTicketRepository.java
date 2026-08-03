package com.carbonfootprint.repository;

import com.carbonfootprint.entity.SupportTicket;
import com.carbonfootprint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByAuthorOrderByCreatedAtDesc(User author);
    List<SupportTicket> findAllByOrderByCreatedAtDesc();
}
