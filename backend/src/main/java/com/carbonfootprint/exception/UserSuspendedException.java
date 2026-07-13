package com.carbonfootprint.exception;

import com.carbonfootprint.dto.admin.UserSuspensionResponse;
import lombok.Getter;

@Getter
public class UserSuspendedException extends RuntimeException {
    
    private final UserSuspensionResponse suspensionDetails;

    public UserSuspendedException(String message, UserSuspensionResponse suspensionDetails) {
        super(message);
        this.suspensionDetails = suspensionDetails;
    }
}
