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
public class UserSuspensionResponse {
    private Long id;
    private Long userId;
    private String reason;
    private String description;
    private String evidenceNotes;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String suspendedBy;
    private boolean active;
    private LocalDateTime revokedDate;
    private String revokedBy;
    private LocalDateTime createdAt;
}
