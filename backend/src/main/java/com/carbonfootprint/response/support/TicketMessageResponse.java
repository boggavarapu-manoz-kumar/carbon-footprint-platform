package com.carbonfootprint.response.support;

import com.carbonfootprint.entity.TicketMessage;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketMessageResponse {
    private Long id;
    private String authorName;
    private String authorRole;
    private String content;
    private boolean isInternal;
    private String attachmentUrl;
    private LocalDateTime createdAt;
    private boolean isRead;
    private LocalDateTime readAt;

    public TicketMessageResponse(TicketMessage message) {
        this.id = message.getId();
        this.authorName = message.getAuthor() != null ? message.getAuthor().getFirstName() + " " + message.getAuthor().getLastName() : "Unknown";
        this.authorRole = message.getAuthor() != null ? message.getAuthor().getRole().name() : "USER";
        this.content = message.getContent();
        this.isInternal = message.isInternal();
        this.attachmentUrl = message.getAttachmentUrl();
        this.createdAt = message.getCreatedAt();
        this.isRead = message.isRead();
        this.readAt = message.getReadAt();
    }
}
