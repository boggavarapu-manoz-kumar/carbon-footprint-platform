package com.carbonfootprint.response.support;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminTicketStatsResponse {
    private long totalTickets;
    private long open;
    private long inProgress;
    private long resolved;
    private long closed;
    private long overdue;
    private long highPriority;
}
