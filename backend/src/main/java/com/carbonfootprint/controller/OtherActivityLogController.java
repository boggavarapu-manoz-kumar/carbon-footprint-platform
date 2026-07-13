package com.carbonfootprint.controller;

import com.carbonfootprint.dto.activity.OtherActivityLogCreateDto;
import com.carbonfootprint.dto.activity.OtherActivityLogDto;
import com.carbonfootprint.service.OtherActivityLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/other-activities")
@RequiredArgsConstructor
@Slf4j
public class OtherActivityLogController {

    private final OtherActivityLogService service;

    @PostMapping
    public ResponseEntity<OtherActivityLogDto> createLog(
            @Valid @RequestBody OtherActivityLogCreateDto createDto,
            Authentication authentication) {
        log.info("REST request to log custom Other Activity for user: {}", authentication.getName());
        OtherActivityLogDto result = service.createOtherActivityLog(authentication.getName(), createDto);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<OtherActivityLogDto>> getLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(sort = "logDate", direction = Sort.Direction.DESC) Pageable pageable,
            Authentication authentication) {
        log.info("REST request to get Other Activity logs for user: {}", authentication.getName());
        Page<OtherActivityLogDto> result = service.searchOtherActivityLogs(authentication.getName(), startDate, endDate, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OtherActivityLogDto> getLogById(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("REST request to get Other Activity log : {} for user: {}", id, authentication.getName());
        OtherActivityLogDto result = service.getOtherActivityLogById(id, authentication.getName());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLog(
            @PathVariable Long id,
            Authentication authentication) {
        log.info("REST request to delete Other Activity log : {} for user: {}", id, authentication.getName());
        service.deleteOtherActivityLog(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
