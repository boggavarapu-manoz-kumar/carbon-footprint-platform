package com.carbonfootprint.controller;

import com.carbonfootprint.dto.support.TicketCreateRequest;
import com.carbonfootprint.dto.support.TicketMessageCreateRequest;
import com.carbonfootprint.response.support.TicketMessageResponse;
import com.carbonfootprint.response.support.TicketResponse;
import com.carbonfootprint.dto.support.TicketFeedbackCreateRequest;
import com.carbonfootprint.response.support.TicketFeedbackResponse;
import com.carbonfootprint.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final SupportTicketService ticketService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketResponse> createTicket(
            @RequestPart("data") TicketCreateRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.createTicket(request, file, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getMyTickets(Authentication authentication) {
        return ResponseEntity.ok(ticketService.getUserTickets(authentication.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicket(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ticketService.getTicket(id, authentication.getName()));
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<TicketMessageResponse>> getMessages(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ticketService.getMessages(id, authentication.getName()));
    }

    @PostMapping(value = "/{id}/messages", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TicketMessageResponse> addMessage(
            @PathVariable Long id, 
            @RequestPart("data") TicketMessageCreateRequest request, 
            @RequestPart(value = "file", required = false) MultipartFile file,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.addMessage(id, request, file, authentication.getName()));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<TicketResponse> closeTicket(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ticketService.closeTicketByUser(id, authentication.getName()));
    }

    @PatchMapping("/{id}/escalate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN', 'SUPPORT_TEAM')")
    public ResponseEntity<TicketResponse> escalateTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ticketService.escalateTicket(id));
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<TicketFeedbackResponse> submitFeedback(
            @PathVariable Long id,
            @Valid @RequestBody TicketFeedbackCreateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ticketService.submitFeedback(id, request, authentication.getName()));
    }

    @GetMapping("/{id}/feedback")
    public ResponseEntity<TicketFeedbackResponse> getFeedback(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(ticketService.getFeedback(id, authentication.getName()));
    }
}
