package com.carbonfootprint.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class MissingEmissionFactorException extends RuntimeException {
    public MissingEmissionFactorException(String activityType) {
        super("Emission factor not found for activity type: " + activityType + ". Cannot calculate carbon footprint.");
    }
}
