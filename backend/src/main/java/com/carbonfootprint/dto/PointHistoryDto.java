package com.carbonfootprint.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PointHistoryDto {
    private Long id;
    private Long points;
    private String reason;
    private String referenceId;
    private String actionType;
    private String sourceModule;
    private String status;
    private LocalDateTime timestamp;
}
