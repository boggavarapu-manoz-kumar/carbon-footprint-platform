package com.carbonfootprint.event;

import org.springframework.context.ApplicationEvent;

public class UserMetricsUpdatedEvent extends ApplicationEvent {
    private final Long userId;

    public UserMetricsUpdatedEvent(Object source, Long userId) {
        super(source);
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }
}
