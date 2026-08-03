package com.carbonfootprint.dto.support;

import lombok.Data;

@Data
public class TicketMessageCreateRequest {
    private String content;
    private boolean isInternal;
}
