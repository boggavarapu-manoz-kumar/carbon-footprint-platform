package com.carbonfootprint.event;

import org.springframework.context.ApplicationEvent;

public class GamificationEvent extends ApplicationEvent {
    
    public enum EventType {
        ACTIVITY_LOGGED,
        ACTIVITY_DELETED,
        GOAL_CREATED,
        GOAL_COMPLETED,
        PROFILE_COMPLETED,
        BADGE_EARNED,
        RECOMMENDATION_FOLLOWED
    }

    private final Long userId;
    private final EventType eventType;
    private final String actionType; // For GamificationConfig linking (e.g. DAILY_ACTIVITY_LOGGED)
    private final String sourceModule; // E.g. ACTIVITY_LOG, GOAL, SYSTEM
    private final String referenceId;
    
    // Some events have a payload (like badge rarity/value)
    private final Object payload;

    public GamificationEvent(Object source, Long userId, EventType eventType, String actionType, String sourceModule, String referenceId, Object payload) {
        super(source);
        this.userId = userId;
        this.eventType = eventType;
        this.actionType = actionType;
        this.sourceModule = sourceModule;
        this.referenceId = referenceId;
        this.payload = payload;
    }

    public Long getUserId() {
        return userId;
    }

    public EventType getEventType() {
        return eventType;
    }

    public String getActionType() {
        return actionType;
    }

    public String getSourceModule() {
        return sourceModule;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public Object getPayload() {
        return payload;
    }
}
