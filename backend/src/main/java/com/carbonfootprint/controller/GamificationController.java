package com.carbonfootprint.controller;

import com.carbonfootprint.dto.PointHistoryDto;
import com.carbonfootprint.dto.UserPointsResponseDto;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.GamificationService;
import com.carbonfootprint.service.TimelineService;
import com.carbonfootprint.dto.TimelineEventDto;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/gamification/points")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;
    private final TimelineService timelineService;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String identifier = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsernameOrEmail(identifier, identifier)
                .orElseGet(() -> userRepository.findByEmail(identifier)
                .orElseGet(() -> userRepository.findByUsername(identifier)
                .orElseThrow(() -> new RuntimeException("User not found: " + identifier))));
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<UserPointsResponseDto>> getCurrentUserPoints() {
        User user = getCurrentUser();
        UserPointsResponseDto points = gamificationService.getUserPoints(user.getId());
        return ResponseEntity.ok(ApiResponse.success(points));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<PointHistoryDto>>> getCurrentUserPointHistory(
            @PageableDefault(size = 20) Pageable pageable) {
        User user = getCurrentUser();
        Page<PointHistoryDto> history = gamificationService.getUserPointHistory(user.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping("/timeline")
    public ResponseEntity<List<TimelineEventDto>> getUserTimeline(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(timelineService.getUserTimeline(user));
    }
}
