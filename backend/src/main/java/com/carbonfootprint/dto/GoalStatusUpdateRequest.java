package com.carbonfootprint.dto;

import com.carbonfootprint.entity.GoalStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoalStatusUpdateRequest {
    @NotNull(message = "New status is required")
    private GoalStatus status;
    private String reason;
}
