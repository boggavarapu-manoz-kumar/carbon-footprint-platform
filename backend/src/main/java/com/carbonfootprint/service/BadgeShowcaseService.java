package com.carbonfootprint.service;

import com.carbonfootprint.dto.BadgeShowcaseDto;
import com.carbonfootprint.entity.User;

public interface BadgeShowcaseService {
    BadgeShowcaseDto getBadgeShowcaseForUser(User user);
}
