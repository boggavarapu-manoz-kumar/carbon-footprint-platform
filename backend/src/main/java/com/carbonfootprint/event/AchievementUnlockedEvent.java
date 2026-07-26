package com.carbonfootprint.event;

import org.springframework.context.ApplicationEvent;

public class AchievementUnlockedEvent extends ApplicationEvent {

    private final Long userId;
    private final String badgeName;
    private final String badgeDescription;
    private final String badgeCriteria;

    public AchievementUnlockedEvent(Object source, Long userId, String badgeName, String badgeDescription, String badgeCriteria) {
        super(source);
        this.userId = userId;
        this.badgeName = badgeName;
        this.badgeDescription = badgeDescription;
        this.badgeCriteria = badgeCriteria;
    }

    public Long getUserId() {
        return userId;
    }

    public String getBadgeName() {
        return badgeName;
    }

    public String getBadgeDescription() {
        return badgeDescription;
    }

    public String getBadgeCriteria() {
        return badgeCriteria;
    }
}
