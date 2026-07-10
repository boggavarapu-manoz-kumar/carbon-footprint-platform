package com.carbonfootprint.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuspendUserRequest {
    private String reason;
    private String description;
    private String evidenceNotes;
    private Integer durationDays; // null means permanent, unless customEndDate is provided
    private LocalDateTime customEndDate;
}
