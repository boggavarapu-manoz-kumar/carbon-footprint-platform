package com.carbonfootprint.dto;

import com.carbonfootprint.entity.GoalStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalHistoryResponse {
    private Long id;
    private Long goalId;
    private GoalStatus previousStatus;
    private GoalStatus newStatus;
    private String changeReason;
    private LocalDateTime changedAt;
}
