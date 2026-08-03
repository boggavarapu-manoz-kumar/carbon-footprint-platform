package com.carbonfootprint.controller;

import com.carbonfootprint.dto.support.TicketStatusUpdateRequest;
import com.carbonfootprint.response.support.TicketResponse;
import com.carbonfootprint.response.support.AdminFeedbackStatsResponse;
import com.carbonfootprint.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/tickets")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'SUPPORT_TEAM')")
public class AdminTicketController {

    private final SupportTicketService ticketService;

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/stats")
    public ResponseEntity<com.carbonfootprint.response.support.AdminTicketStatsResponse> getTicketStats() {
        return ResponseEntity.ok(ticketService.getTicketStats());
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicket(@PathVariable Long id, @RequestParam Long adminId) {
        return ResponseEntity.ok(ticketService.assignTicket(id, adminId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id, @RequestBody TicketStatusUpdateRequest request) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, request));
    }

    @GetMapping("/feedback/stats")
    public ResponseEntity<AdminFeedbackStatsResponse> getFeedbackStats() {
        return ResponseEntity.ok(ticketService.getFeedbackStats());
    }
}
