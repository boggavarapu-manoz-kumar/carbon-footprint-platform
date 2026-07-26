package com.carbonfootprint.service;

import com.carbonfootprint.dto.TimelineEventDto;
import com.carbonfootprint.entity.User;

import java.util.List;

public interface TimelineService {
    List<TimelineEventDto> getUserTimeline(User user);
}
