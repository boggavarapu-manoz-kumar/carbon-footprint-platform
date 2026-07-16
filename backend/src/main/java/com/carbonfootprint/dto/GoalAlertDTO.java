package com.carbonfootprint.dto;

import lombok.Builder;
import lombok.Data;

import java.io.Serializable;

@Data
@Builder
public class GoalAlertDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private String alertType; // ENCOURAGEMENT, CORRECTION
    private String message;
    private String severity;  // INFO, WARNING, SUCCESS
    private Long relatedGoalId;
}
