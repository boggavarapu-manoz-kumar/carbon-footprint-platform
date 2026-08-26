package com.carbonfootprint.controller;

import com.carbonfootprint.dto.activity.ActivityLogCreateDto;
import com.carbonfootprint.dto.activity.ActivityLogDto;
import com.carbonfootprint.dto.activity.ActivityLogUpdateDto;
import com.carbonfootprint.dto.activity.UserActivityHistoryDTO;
import com.carbonfootprint.dto.activity.UserActivityHistoryFilterDTO;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.ActivityLogService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.math.BigDecimal;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

    private String resolveUsername(UserDetails userDetails, Authentication authentication) {
        if (userDetails != null && userDetails.getUsername() != null && !userDetails.getUsername().trim().isEmpty()) {
            return userDetails.getUsername().trim();
        }
        if (authentication != null && authentication.getName() != null && !authentication.getName().trim().isEmpty()) {
            return authentication.getName().trim();
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null && !auth.getName().trim().isEmpty()) {
            return auth.getName().trim();
        }
        throw new org.springframework.security.authentication.BadCredentialsException("User is not authenticated");
    }

    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<com.carbonfootprint.dto.activity.CalculationResponseDto>> calculateEmission(
            @Valid @RequestBody com.carbonfootprint.dto.activity.CalculationRequestDto requestDto) {
        log.info("Calculating emission for activity: {}", requestDto.getActivityType());
        com.carbonfootprint.dto.activity.CalculationResponseDto responseDto = activityLogService.calculateEmission(requestDto);
        return ResponseEntity.ok(ApiResponse.success(responseDto));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ActivityLogDto>> createActivityLog(
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication,
            @Valid @RequestBody ActivityLogCreateDto createDto) {
        String username = resolveUsername(userDetails, authentication);
        log.info("Creating single activity log for user: {}", username);
        ActivityLogDto logDto = activityLogService.createActivityLog(username, createDto);
        return new ResponseEntity<>(ApiResponse.success(logDto, "Activity log created successfully"), HttpStatus.CREATED);
    }

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<ActivityLogDto>>> createActivityLogsBulk(
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication,
            @RequestBody @NotEmpty(message = "Payload list cannot be empty") List<@Valid ActivityLogCreateDto> createDtos) {
        String username = resolveUsername(userDetails, authentication);
        log.info("Bulk creating activity logs for user: {}", username);
        List<ActivityLogDto> logs = activityLogService.createActivityLogsBulk(username, createDtos);
        return new ResponseEntity<>(ApiResponse.success(logs, "Bulk insert successful"), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityLogDto>> getActivityLogById(
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication,
            @PathVariable Long id) {
        String username = resolveUsername(userDetails, authentication);
        ActivityLogDto logDto = activityLogService.getActivityLogById(id, username);
        return ResponseEntity.ok(ApiResponse.success(logDto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ActivityLogDto>>> searchActivityLogs(
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(sort = "logDate") Pageable pageable) {
        String username = resolveUsername(userDetails, authentication);
        log.info("Dynamic searching activity logs for user: {}", username);
        Page<ActivityLogDto> logs = activityLogService.searchActivityLogs(
                username, category, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }
    
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<UserActivityHistoryDTO>>> getUnifiedHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) List<String> categories,
            @RequestParam(required = false) String searchActivityName,
            @RequestParam(required = false) BigDecimal minEmission,
            @RequestParam(required = false) BigDecimal maxEmission,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortDirection,
            @PageableDefault(sort = "createdAt") Pageable pageable) {
        String username = resolveUsername(userDetails, authentication);
        UserActivityHistoryFilterDTO filter = UserActivityHistoryFilterDTO.builder()
                .startDate(startDate)
                .endDate(endDate)
                .categories(categories)
                .searchActivityName(searchActivityName)
                .minEmission(minEmission)
                .maxEmission(maxEmission)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();
                
        Page<UserActivityHistoryDTO> logs = activityLogService.getUnifiedActivityHistory(username, filter, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityLogDto>> updateActivityLog(
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody ActivityLogUpdateDto updateDto) {
        String username = resolveUsername(userDetails, authentication);
        ActivityLogDto updatedLog = activityLogService.updateActivityLog(id, username, updateDto);
        return ResponseEntity.ok(ApiResponse.success(updatedLog, "Activity log updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteActivityLog(
            @AuthenticationPrincipal UserDetails userDetails,
            Authentication authentication,
            @PathVariable Long id) {
        String username = resolveUsername(userDetails, authentication);
        activityLogService.deleteActivityLog(id, username);
        return ResponseEntity.ok(ApiResponse.success(null, "Activity log deleted successfully"));
    }
}
