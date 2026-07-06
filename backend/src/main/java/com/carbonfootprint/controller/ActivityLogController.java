package com.carbonfootprint.controller;

import com.carbonfootprint.dto.activity.ActivityLogCreateDto;
import com.carbonfootprint.dto.activity.ActivityLogDto;
import com.carbonfootprint.dto.activity.ActivityLogUpdateDto;
import com.carbonfootprint.entity.ActivityCategory;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Validated
@RestController
@RequestMapping("/api/v1/activities")
@RequiredArgsConstructor
public class ActivityLogController {

    private final ActivityLogService activityLogService;

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
            @Valid @RequestBody ActivityLogCreateDto createDto) {
        log.info("Creating single activity log");
        ActivityLogDto logDto = activityLogService.createActivityLog(userDetails.getUsername(), createDto);
        return new ResponseEntity<>(ApiResponse.success(logDto, "Activity log created successfully"), HttpStatus.CREATED);
    }

    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<ActivityLogDto>>> createActivityLogsBulk(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @NotEmpty(message = "Payload list cannot be empty") List<@Valid ActivityLogCreateDto> createDtos) {
        log.info("Bulk creating activity logs");
        List<ActivityLogDto> logs = activityLogService.createActivityLogsBulk(userDetails.getUsername(), createDtos);
        return new ResponseEntity<>(ApiResponse.success(logs, "Bulk insert successful"), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityLogDto>> getActivityLogById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        ActivityLogDto logDto = activityLogService.getActivityLogById(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(logDto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ActivityLogDto>>> searchActivityLogs(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(sort = "logDate") Pageable pageable) {
        
        log.info("Dynamic searching activity logs");
        Page<ActivityLogDto> logs = activityLogService.searchActivityLogs(
                userDetails.getUsername(), category, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityLogDto>> updateActivityLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ActivityLogUpdateDto updateDto) {
        ActivityLogDto updatedLog = activityLogService.updateActivityLog(id, userDetails.getUsername(), updateDto);
        return ResponseEntity.ok(ApiResponse.success(updatedLog, "Activity log updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteActivityLog(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        activityLogService.deleteActivityLog(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null, "Activity log deleted successfully"));
    }
}
