package com.carbonfootprint.dto.support;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TicketFeedbackCreateRequest {
    @NotNull(message = "Overall satisfaction is required")
    @Min(1)
    @Max(5)
    private Integer overallSatisfaction;

    @NotBlank(message = "Support quality is required")
    private String supportQuality;

    @NotBlank(message = "Response time is required")
    private String responseTime;

    @NotBlank(message = "Problem resolution is required")
    private String problemResolution;

    private String comments;
}
