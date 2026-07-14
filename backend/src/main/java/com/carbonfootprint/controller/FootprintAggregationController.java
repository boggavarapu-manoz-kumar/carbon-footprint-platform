package com.carbonfootprint.controller;

import com.carbonfootprint.dto.AggregationResponseDTO;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.service.FootprintAggregationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/user/aggregations")
@RequiredArgsConstructor
public class FootprintAggregationController {

    private final FootprintAggregationService aggregationService;

    @GetMapping
    public ResponseEntity<AggregationResponseDTO> getAggregations(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "DAILY") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate referenceDate) {
        
        if (referenceDate == null) {
            referenceDate = LocalDate.now();
        }
        
        AggregationResponseDTO response = aggregationService.getAggregation(user.getId(), period, referenceDate);
        return ResponseEntity.ok(response);
    }
}
