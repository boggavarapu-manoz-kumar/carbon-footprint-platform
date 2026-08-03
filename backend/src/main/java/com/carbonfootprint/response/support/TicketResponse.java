package com.carbonfootprint.response.support;

import com.carbonfootprint.entity.SupportTicket;
import com.carbonfootprint.entity.TicketCategory;
import com.carbonfootprint.entity.TicketPriority;
import com.carbonfootprint.entity.TicketStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketResponse {
    private Long id;
    private String ticketNumber;
    private String title;
    private String description;
    private TicketStatus status;
    private TicketPriority priority;
    private TicketCategory category;
    private String authorName;
    private String assignedToName;
    private String preferredContactMethod;
    private String attachmentUrl;
    private Integer unreadUserReplies;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean hasFeedback;

    public TicketResponse(SupportTicket ticket) {
        this.id = ticket.getId();
        this.ticketNumber = ticket.getTicketNumber();
        this.title = ticket.getTitle();
        this.description = ticket.getDescription();
        this.status = ticket.getStatus();
        this.priority = ticket.getPriority();
        this.category = ticket.getCategory();
        this.authorName = ticket.getAuthor() != null ? ticket.getAuthor().getFirstName() + " " + ticket.getAuthor().getLastName() : null;
        this.assignedToName = ticket.getAssignedTo() != null ? ticket.getAssignedTo().getFirstName() + " " + ticket.getAssignedTo().getLastName() : "Unassigned";
        this.preferredContactMethod = ticket.getPreferredContactMethod();
        this.attachmentUrl = ticket.getAttachmentUrl();
        this.unreadUserReplies = ticket.getUnreadUserReplies();
        this.createdAt = ticket.getCreatedAt();
        this.updatedAt = ticket.getUpdatedAt();
        this.hasFeedback = ticket.getFeedback() != null;
    }
}
