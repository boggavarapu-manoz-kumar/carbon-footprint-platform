package com.carbonfootprint.response.support;

import com.carbonfootprint.entity.TicketFeedback;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TicketFeedbackResponse {
    private Long id;
    private Long ticketId;
    private Integer overallSatisfaction;
    private String supportQuality;
    private String responseTime;
    private String problemResolution;
    private String comments;
    private LocalDateTime createdAt;

    public TicketFeedbackResponse(TicketFeedback feedback) {
        this.id = feedback.getId();
        this.ticketId = feedback.getTicket().getId();
        this.overallSatisfaction = feedback.getOverallSatisfaction();
        this.supportQuality = feedback.getSupportQuality();
        this.responseTime = feedback.getResponseTime();
        this.problemResolution = feedback.getProblemResolution();
        this.comments = feedback.getComments();
        this.createdAt = feedback.getCreatedAt();
    }
}
