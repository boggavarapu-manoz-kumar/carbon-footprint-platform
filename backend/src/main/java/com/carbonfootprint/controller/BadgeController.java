package com.carbonfootprint.controller;

import com.carbonfootprint.entity.User;
import com.carbonfootprint.entity.UserBadge;
import com.carbonfootprint.dto.BadgeShowcaseDto;
import com.carbonfootprint.repository.UserBadgeRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.BadgeShowcaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;
    private final BadgeShowcaseService badgeShowcaseService;

    @GetMapping("/showcase")
    public ResponseEntity<BadgeShowcaseDto> getBadgeShowcase(Authentication authentication) {
        String identifier = authentication.getName();
        User user = userRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseGet(() -> userRepository.findByEmail(identifier)
                .orElseGet(() -> userRepository.findByUsername(identifier)
                .orElseThrow(() -> new com.carbonfootprint.exception.ResourceNotFoundException("User not found: " + identifier))));
        return ResponseEntity.ok(badgeShowcaseService.getBadgeShowcaseForUser(user));
    }

    @GetMapping
    public ResponseEntity<List<BadgeDto>> getUserBadges(Authentication authentication) {
        String identifier = authentication.getName();
        User user = userRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseGet(() -> userRepository.findByEmail(identifier)
                .orElseGet(() -> userRepository.findByUsername(identifier)
                .orElseThrow(() -> new com.carbonfootprint.exception.ResourceNotFoundException("User not found: " + identifier))));

        List<BadgeDto> badges = userBadgeRepository.findByUserId(user.getId()).stream()
                .map(ub -> {
                    BadgeDto dto = new BadgeDto();
                    dto.name = ub.getBadge().getName();
                    dto.description = ub.getBadge().getDescription();
                    dto.criteria = ub.getBadge().getCriteria();
                    dto.earnedAt = ub.getAwardedAt().toString();
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(badges);
    }

    public static class BadgeDto {
        public String name;
        public String description;
        public String criteria;
        public String earnedAt;
    }
}
