package com.carbonfootprint.dto.admin;

import lombok.Data;
import java.util.List;
import jakarta.validation.constraints.NotEmpty;

@Data
public class BulkSuspendRequest {
    @NotEmpty(message = "User IDs cannot be empty")
    private List<Long> userIds;
    private Integer durationDays;
    private java.time.LocalDateTime customEndDate;
    private String reason;
    private String description;
    private String evidenceNotes;
}
