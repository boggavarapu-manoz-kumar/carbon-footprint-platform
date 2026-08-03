package com.carbonfootprint.dto.support;

import com.carbonfootprint.entity.TicketStatus;
import lombok.Data;

@Data
public class TicketStatusUpdateRequest {
    private TicketStatus status;
}
