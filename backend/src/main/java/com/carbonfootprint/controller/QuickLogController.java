package com.carbonfootprint.controller;

import com.carbonfootprint.dto.activity.QuickLogDto;
import com.carbonfootprint.dto.activity.QuickLogPinRequest;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.QuickLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quick-logs")
@RequiredArgsConstructor
@Slf4j
public class QuickLogController {

    private final QuickLogService quickLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuickLogDto>>> getQuickLogs(Authentication authentication) {
        log.debug("Fetching quick logs for user: {}", authentication.getName());
        List<QuickLogDto> quickLogs = quickLogService.getQuickLogs(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(quickLogs));
    }

    @PostMapping("/pin")
    public ResponseEntity<ApiResponse<QuickLogDto>> pinActivity(
            Authentication authentication,
            @Valid @RequestBody QuickLogPinRequest request) {
        log.info("User {} pinning activity: {}", authentication.getName(), request.getActivityTypeId());
        QuickLogDto pinned = quickLogService.pinActivity(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(pinned, "Activity pinned successfully"));
    }

    @DeleteMapping("/pin/{id}")
    public ResponseEntity<ApiResponse<Void>> unpinActivity(
            Authentication authentication,
            @PathVariable Long id) {
        log.info("User {} unpinning activity id: {}", authentication.getName(), id);
        quickLogService.unpinActivity(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success(null, "Activity unpinned successfully"));
    }
}
