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

import org.springframework.security.core.Authentication;
import com.carbonfootprint.dto.support.TicketMessageCreateRequest;
import com.carbonfootprint.response.support.TicketMessageResponse;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
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

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ticketService.getTicketForAdmin(id));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<TicketMessageResponse>> getMessages(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ticketService.getMessagesForAdmin(id, authentication.getName()));
    }

    @PostMapping(value = "/{id}/messages", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketMessageResponse> addMessage(
            @PathVariable Long id, 
            @RequestPart("data") TicketMessageCreateRequest request, 
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.addMessageForAdmin(id, request, file, authentication.getName()));
    }

    @GetMapping("/{id}/feedback")
    public ResponseEntity<com.carbonfootprint.response.support.TicketFeedbackResponse> getFeedback(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.getFeedbackForAdmin(id));
    }

    @PatchMapping("/{id}/escalate")
    public ResponseEntity<TicketResponse> escalateTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.escalateTicket(id));
    }
}
