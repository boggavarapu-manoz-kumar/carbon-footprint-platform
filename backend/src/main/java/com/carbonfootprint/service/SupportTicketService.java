package com.carbonfootprint.service;

import com.carbonfootprint.dto.support.TicketCreateRequest;
import com.carbonfootprint.dto.support.TicketMessageCreateRequest;
import com.carbonfootprint.dto.support.TicketStatusUpdateRequest;
import com.carbonfootprint.entity.*;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.repository.SupportTicketRepository;
import com.carbonfootprint.repository.TicketFeedbackRepository;
import com.carbonfootprint.repository.TicketMessageRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.repository.admin.AdminUserRepository;
import com.carbonfootprint.response.support.AdminTicketStatsResponse;
import com.carbonfootprint.response.support.TicketMessageResponse;
import com.carbonfootprint.response.support.TicketResponse;
import com.carbonfootprint.response.support.TicketFeedbackResponse;
import com.carbonfootprint.response.support.AdminFeedbackStatsResponse;
import com.carbonfootprint.dto.support.TicketFeedbackCreateRequest;
import com.carbonfootprint.entity.TicketPriority;
import com.carbonfootprint.entity.admin.AdminUser;
import java.time.LocalDateTime;
import com.carbonfootprint.response.support.TicketResponse;
import com.carbonfootprint.service.admin.AdminNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.time.Year;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportTicketService {

    private final SupportTicketRepository supportTicketRepository;
    private final TicketMessageRepository ticketMessageRepository;
    private final TicketFeedbackRepository ticketFeedbackRepository;
    private final UserRepository userRepository;
    private final AdminUserRepository adminUserRepository;
    private final CloudinaryService cloudinaryService;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final AdminNotificationService adminNotificationService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.admin.url:http://localhost:5174}")
    private String adminUrl;

    @Transactional
    public TicketResponse createTicket(TicketCreateRequest request, MultipartFile file, String username) {
        User author = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String attachmentUrl = null;
        if (file != null && !file.isEmpty()) {
            try {
                attachmentUrl = cloudinaryService.uploadFile(file, "support_tickets");
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload attachment", e);
            }
        }

        String ticketNumber = "CF-" + Year.now().getValue() + "-" + String.format("%06d", (int)(Math.random() * 999999));

        SupportTicket ticket = SupportTicket.builder()
                .ticketNumber(ticketNumber)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .category(request.getCategory())
                .preferredContactMethod(request.getPreferredContactMethod())
                .attachmentUrl(attachmentUrl)
                .status(TicketStatus.OPEN)
                .author(author)
                .build();

        SupportTicket saved = supportTicketRepository.save(ticket);
        
        // Trigger Email
        if (author.getEmail() != null) {
            String ticketLink = frontendUrl + "/dashboard/support/" + saved.getId();
            emailService.sendSupportTicketUpdateEmail(
                author.getEmail(),
                saved.getTicketNumber(),
                "Support Ticket Created: " + saved.getTitle(),
                saved.getStatus().name(),
                "",
                ticketLink,
                "support-ticket-created"
            );
        }

        // Trigger Notification
        notificationService.createSupportTicketNotification(
                author, saved.getTicketNumber(), "CREATED", "Ticket submitted successfully"
        );

        // Notify admins
        adminNotificationService.createNotification(
                "New Support Ticket",
                "Ticket #" + saved.getTicketNumber() + " created by " + author.getUsername(),
                "SUPPORT_TICKET",
                "NORMAL",
                null
        );

        return new TicketResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getUserTickets(String username) {
        User author = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return supportTicketRepository.findByAuthorOrderByCreatedAtDesc(author)
                .stream()
                .map(TicketResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getAllTickets() {
        return supportTicketRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(TicketResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicket(Long id, String username) {
        SupportTicket ticket = getTicketEntity(id);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // If not admin/support, check ownership
        if (!user.getRole().name().equals("SUPER_ADMIN") && 
            !user.getRole().name().equals("ADMIN") && 
            !user.getRole().name().equals("SUPPORT_TEAM")) {
            if (!ticket.getAuthor().getId().equals(user.getId())) {
                throw new RuntimeException("Not authorized to view this ticket");
            }
        }
        return new TicketResponse(ticket);
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketForAdmin(Long id) {
        SupportTicket ticket = getTicketEntity(id);
        return new TicketResponse(ticket);
    }

    @Transactional
    public TicketResponse assignTicket(Long id, Long adminId) {
        SupportTicket ticket = getTicketEntity(id);
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        ticket.setAssignedTo(admin);
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        SupportTicket saved = supportTicketRepository.save(ticket);
        
        // Notify admin
        adminNotificationService.createNotification(
                "Ticket Assigned",
                "Ticket #" + saved.getTicketNumber() + " assigned to you",
                "SUPPORT_TICKET",
                "NORMAL",
                admin.getId()
        );
        
        if (admin.getEmail() != null) {
            String ticketLink = adminUrl + "/support/" + saved.getId();
            emailService.sendSupportTicketUpdateEmail(
                admin.getEmail(),
                saved.getTicketNumber(),
                "Ticket Assigned: " + saved.getTitle(),
                saved.getStatus().name(),
                "",
                ticketLink,
                "support-ticket-assigned"
            );
        }

        return new TicketResponse(saved);
    }

    @Transactional
    public TicketResponse updateTicketStatus(Long id, TicketStatusUpdateRequest request) {
        SupportTicket ticket = getTicketEntity(id);
        ticket.setStatus(request.getStatus());
        SupportTicket saved = supportTicketRepository.save(ticket);
        
        // Notify user
        User author = saved.getAuthor();
        notificationService.createSupportTicketNotification(
                author,
                saved.getTicketNumber(),
                saved.getStatus().name(),
                "Ticket status updated to " + saved.getStatus().name().replace("_", " ")
        );
        
        if (author.getEmail() != null) {
            String ticketLink = frontendUrl + "/dashboard/support/" + saved.getId();
            emailService.sendSupportTicketUpdateEmail(
                author.getEmail(),
                saved.getTicketNumber(),
                "Ticket Status Updated: " + saved.getTitle(),
                saved.getStatus().name(),
                "",
                ticketLink,
                "support-ticket-status-changed"
            );
        }
        
        return new TicketResponse(saved);
    }

    @Transactional
    public TicketMessageResponse addMessage(Long ticketId, TicketMessageCreateRequest request, MultipartFile file, String username) {
        SupportTicket ticket = getTicketEntity(ticketId);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Only admins can post internal messages
        boolean isInternal = request.isInternal();
        if (isInternal && !user.getRole().name().equals("SUPER_ADMIN") && 
            !user.getRole().name().equals("ADMIN") && 
            !user.getRole().name().equals("SUPPORT_TEAM")) {
            isInternal = false;
        }

        String attachmentUrl = null;
        if (file != null && !file.isEmpty()) {
            try {
                attachmentUrl = cloudinaryService.uploadFile(file, "ticket_messages");
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload attachment", e);
            }
        }

        TicketMessage message = TicketMessage.builder()
                .ticket(ticket)
                .author(user)
                .content(request.getContent())
                .isInternal(isInternal)
                .attachmentUrl(attachmentUrl)
                .build();

        TicketMessage saved = ticketMessageRepository.save(message);

        // Auto-update status if user replies and it was resolved
        if (!isInternal && user.getId().equals(ticket.getAuthor().getId())) {
            if (ticket.getStatus() == TicketStatus.RESOLVED || ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.WAITING_FOR_USER) {
                ticket.setStatus(TicketStatus.REOPENED);
            }
        }

        supportTicketRepository.save(ticket);

        return new TicketMessageResponse(saved);
    }

    @Transactional
    public TicketMessageResponse addMessageForAdmin(Long ticketId, TicketMessageCreateRequest request, MultipartFile file, String adminEmail) {
        SupportTicket ticket = getTicketEntity(ticketId);
        
        // Ensure admin has a User record so they can author messages
        User user = userRepository.findByEmail(adminEmail)
                .orElseGet(() -> {
                    AdminUser admin = adminUserRepository.findByEmail(adminEmail)
                            .orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
                    User newUser = User.builder()
                            .email(admin.getEmail())
                            .username("adm_" + java.util.UUID.randomUUID().toString().substring(0, 8))
                            .firstName("Admin")
                            .lastName("Support")
                            .mobileNumber("0000000000")
                            .gender("OTHER")
                            .role(com.carbonfootprint.entity.Role.ADMIN)
                            .provider(com.carbonfootprint.entity.AuthProvider.LOCAL)
                            .password("placeholder")
                            .build();
                    return userRepository.save(newUser);
                });

        boolean isInternal = request.isInternal();
        String attachmentUrl = null;
        if (file != null && !file.isEmpty()) {
            try {
                attachmentUrl = cloudinaryService.uploadFile(file, "ticket_messages");
            } catch (Exception e) {
                throw new RuntimeException("Failed to upload attachment", e);
            }
        }

        TicketMessage message = TicketMessage.builder()
                .ticket(ticket)
                .author(user)
                .content(request.getContent())
                .isInternal(isInternal)
                .attachmentUrl(attachmentUrl)
                .build();

        TicketMessage saved = ticketMessageRepository.save(message);

        // Increment unread user replies if admin sends a public message
        if (!isInternal) {
            ticket.setUnreadUserReplies(ticket.getUnreadUserReplies() + 1);
            ticket.setStatus(TicketStatus.WAITING_FOR_USER);
            
            // Notify user
            notificationService.createSupportTicketNotification(
                    ticket.getAuthor(),
                    ticket.getTicketNumber(),
                    ticket.getStatus().name(),
                    "New reply from admin"
            );
            
            if (ticket.getAuthor().getEmail() != null) {
                String ticketLink = frontendUrl + "/dashboard/support/" + ticket.getId();
                emailService.sendSupportTicketUpdateEmail(
                    ticket.getAuthor().getEmail(),
                    ticket.getTicketNumber(),
                    "New Reply on Support Ticket: " + ticket.getTitle(),
                    ticket.getStatus().name(),
                    request.getContent(),
                    ticketLink,
                    "support-ticket-replied"
                );
            }
        }

        supportTicketRepository.save(ticket);
        return new TicketMessageResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TicketMessageResponse> getMessages(Long ticketId, String username) {
        SupportTicket ticket = getTicketEntity(ticketId);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isAdmin = user.getRole().name().equals("SUPER_ADMIN") || 
                          user.getRole().name().equals("ADMIN") || 
                          user.getRole().name().equals("SUPPORT_TEAM");

        if (!isAdmin && !ticket.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized");
        }

        if (!isAdmin) {
            ticket.setUnreadUserReplies(0);
            supportTicketRepository.save(ticket);
        }

        List<TicketMessage> messages = isAdmin 
                ? ticketMessageRepository.findByTicketOrderByCreatedAtAsc(ticket)
                : ticketMessageRepository.findByTicketAndIsInternalFalseOrderByCreatedAtAsc(ticket);

        // Mark messages as read
        boolean updated = false;
        LocalDateTime now = LocalDateTime.now();
        for (TicketMessage msg : messages) {
            if (!msg.isRead() && !msg.getAuthor().getId().equals(user.getId())) {
                msg.setRead(true);
                msg.setReadAt(now);
                updated = true;
            }
        }
        if (updated) {
            ticketMessageRepository.saveAll(messages);
        }

        return messages.stream()
                .map(TicketMessageResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TicketMessageResponse> getMessagesForAdmin(Long ticketId, String adminEmail) {
        SupportTicket ticket = getTicketEntity(ticketId);
        List<TicketMessage> messages = ticketMessageRepository.findByTicketOrderByCreatedAtAsc(ticket);
        
        // Mark user messages as read by admin
        boolean updated = false;
        LocalDateTime now = LocalDateTime.now();
        for (TicketMessage msg : messages) {
            if (!msg.isRead() && msg.getAuthor().getRole().name().equals("USER")) {
                msg.setRead(true);
                msg.setReadAt(now);
                updated = true;
            }
        }
        if (updated) {
            ticketMessageRepository.saveAll(messages);
        }

        return messages.stream()
                .map(TicketMessageResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public TicketResponse closeTicketByUser(Long ticketId, String username) {
        SupportTicket ticket = getTicketEntity(ticketId);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (!ticket.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to close this ticket");
        }

        ticket.setStatus(TicketStatus.CLOSED);
        SupportTicket saved = supportTicketRepository.save(ticket);
        
        // Notify admin
        if (saved.getAssignedTo() != null) {
            adminNotificationService.createNotification(
                    "Ticket Closed",
                    "Ticket #" + saved.getTicketNumber() + " was closed by user",
                    "SUPPORT_TICKET",
                    "NORMAL",
                    saved.getAssignedTo().getId()
            );
        } else {
            adminNotificationService.createNotification(
                    "Ticket Closed",
                    "Ticket #" + saved.getTicketNumber() + " was closed by user",
                    "SUPPORT_TICKET",
                    "NORMAL",
                    null
            );
        }
        
        return new TicketResponse(saved);
    }

    @Transactional
    public TicketResponse escalateTicket(Long ticketId) {
        SupportTicket ticket = getTicketEntity(ticketId);
        TicketPriority currentPriority = ticket.getPriority();
        
        if (TicketPriority.LOW.equals(currentPriority)) {
            ticket.setPriority(TicketPriority.MEDIUM);
        } else if (TicketPriority.MEDIUM.equals(currentPriority)) {
            ticket.setPriority(TicketPriority.HIGH);
        } else if (TicketPriority.HIGH.equals(currentPriority)) {
            ticket.setPriority(TicketPriority.CRITICAL);
        }
        
        return new TicketResponse(supportTicketRepository.save(ticket));
    }

    @Transactional(readOnly = true)
    public AdminTicketStatsResponse getTicketStats() {
        List<SupportTicket> allTickets = supportTicketRepository.findAll();
        
        long totalTickets = allTickets.size();
        long open = 0;
        long inProgress = 0;
        long resolved = 0;
        long closed = 0;
        long overdue = 0;
        long highPriority = 0;
        
        LocalDateTime now = LocalDateTime.now();
        
        for (SupportTicket ticket : allTickets) {
            switch (ticket.getStatus()) {
                case OPEN:
                case REOPENED:
                    open++;
                    break;
                case IN_PROGRESS:
                case WAITING_FOR_USER:
                    inProgress++;
                    break;
                case RESOLVED:
                    resolved++;
                    break;
                case CLOSED:
                    closed++;
                    break;
            }
            
            if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
                if (ticket.getUpdatedAt() != null && ticket.getUpdatedAt().isBefore(now.minusHours(24))) {
                    overdue++;
                }
            }
            
            if (TicketPriority.HIGH.equals(ticket.getPriority()) || TicketPriority.CRITICAL.equals(ticket.getPriority())) {
                highPriority++;
            }
        }
        
        return AdminTicketStatsResponse.builder()
                .totalTickets(totalTickets)
                .open(open)
                .inProgress(inProgress)
                .resolved(resolved)
                .closed(closed)
                .overdue(overdue)
                .highPriority(highPriority)
                .build();
    }

    private SupportTicket getTicketEntity(Long id) {
        return supportTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
    }

    @Transactional
    public TicketFeedbackResponse submitFeedback(Long ticketId, TicketFeedbackCreateRequest request, String username) {
        SupportTicket ticket = getTicketEntity(ticketId);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!ticket.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("Not authorized to submit feedback for this ticket");
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new RuntimeException("Feedback can only be submitted for resolved or closed tickets");
        }

        if (ticketFeedbackRepository.existsByTicketId(ticketId)) {
            throw new RuntimeException("Feedback already submitted for this ticket");
        }

        TicketFeedback feedback = TicketFeedback.builder()
                .ticket(ticket)
                .overallSatisfaction(request.getOverallSatisfaction())
                .supportQuality(request.getSupportQuality())
                .responseTime(request.getResponseTime())
                .problemResolution(request.getProblemResolution())
                .comments(request.getComments())
                .build();

        return new TicketFeedbackResponse(ticketFeedbackRepository.save(feedback));
    }

    @Transactional(readOnly = true)
    public TicketFeedbackResponse getFeedback(Long ticketId, String username) {
        SupportTicket ticket = getTicketEntity(ticketId);
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        // Just verify ownership
        if (!user.getRole().name().equals("SUPER_ADMIN") && 
            !user.getRole().name().equals("ADMIN") && 
            !user.getRole().name().equals("SUPPORT_TEAM")) {
            if (!ticket.getAuthor().getId().equals(user.getId())) {
                throw new RuntimeException("Not authorized");
            }
        }

        return ticketFeedbackRepository.findByTicket(ticket)
                .map(TicketFeedbackResponse::new)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
    }

    @Transactional(readOnly = true)
    public TicketFeedbackResponse getFeedbackForAdmin(Long ticketId) {
        SupportTicket ticket = getTicketEntity(ticketId);
        return ticketFeedbackRepository.findByTicket(ticket)
                .map(TicketFeedbackResponse::new)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found"));
    }

    @Transactional(readOnly = true)
    public AdminFeedbackStatsResponse getFeedbackStats() {
        List<TicketFeedback> allFeedback = ticketFeedbackRepository.findAll();
        
        if (allFeedback.isEmpty()) {
            return AdminFeedbackStatsResponse.builder()
                    .averageRating(0.0)
                    .customerSatisfactionScore(0.0)
                    .totalFeedback(0L)
                    .excellentCount(0L)
                    .goodCount(0L)
                    .averageCount(0L)
                    .poorCount(0L)
                    .terribleCount(0L)
                    .build();
        }

        long total = allFeedback.size();
        double sum = 0;
        long csatCount = 0; // 4 or 5 stars
        long excellent = 0, good = 0, avg = 0, poor = 0, terrible = 0;

        for (TicketFeedback f : allFeedback) {
            int score = f.getOverallSatisfaction();
            sum += score;
            if (score >= 4) csatCount++;
            
            switch(score) {
                case 5: excellent++; break;
                case 4: good++; break;
                case 3: avg++; break;
                case 2: poor++; break;
                case 1: terrible++; break;
            }
        }

        return AdminFeedbackStatsResponse.builder()
                .averageRating(Math.round((sum / total) * 10.0) / 10.0)
                .customerSatisfactionScore(Math.round(((double)csatCount / total * 100.0) * 10.0) / 10.0)
                .totalFeedback(total)
                .excellentCount(excellent)
                .goodCount(good)
                .averageCount(avg)
                .poorCount(poor)
                .terribleCount(terrible)
                .build();
    }
}
