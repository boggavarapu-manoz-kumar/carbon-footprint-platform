package com.carbonfootprint.dto.support;

import com.carbonfootprint.entity.TicketCategory;
import com.carbonfootprint.entity.TicketPriority;
import lombok.Data;

@Data
public class TicketCreateRequest {
    private String title;
    private String description;
    private TicketPriority priority;
    private TicketCategory category;
    private String preferredContactMethod;
}
