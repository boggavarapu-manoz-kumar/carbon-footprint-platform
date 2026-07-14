package com.carbonfootprint.service;

import com.carbonfootprint.dto.AggregationResponseDTO;
import com.carbonfootprint.dto.FootprintAggregationProjectionDTO;
import com.carbonfootprint.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FootprintAggregationService {

    private final ActivityLogRepository activityLogRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "footprint_aggregations", key = "#userId + '-' + #period + '-' + #referenceDate.toString()")
    public AggregationResponseDTO getAggregation(Long userId, String period, LocalDate referenceDate) {
        log.info("Calculating footprint aggregation for user {} | Period: {} | Date: {}", userId, period, referenceDate);
        
        LocalDate startDate = referenceDate;
        LocalDate endDate = referenceDate;

        switch (period.toUpperCase()) {
            case "DAILY":
                break;
            case "WEEKLY":
                startDate = referenceDate.with(DayOfWeek.MONDAY);
                endDate = referenceDate.with(DayOfWeek.SUNDAY);
                break;
            case "MONTHLY":
                startDate = referenceDate.withDayOfMonth(1);
                endDate = referenceDate.withDayOfMonth(referenceDate.lengthOfMonth());
                break;
            default:
                throw new IllegalArgumentException("Invalid period. Must be DAILY, WEEKLY, or MONTHLY");
        }

        List<FootprintAggregationProjectionDTO> breakdown = activityLogRepository.getOptimizedAggregations(userId, startDate, endDate);

        BigDecimal overallTotalCarbon = BigDecimal.ZERO;
        Long overallTotalActivities = 0L;

        for (FootprintAggregationProjectionDTO dto : breakdown) {
            if (dto.getTotalCarbon() != null) {
                overallTotalCarbon = overallTotalCarbon.add(dto.getTotalCarbon());
            }
            if (dto.getTotalActivities() != null) {
                overallTotalActivities += dto.getTotalActivities();
            }
        }

        return AggregationResponseDTO.builder()
                .period(period.toUpperCase())
                .startDate(startDate)
                .endDate(endDate)
                .overallTotalCarbon(overallTotalCarbon)
                .overallTotalActivities(overallTotalActivities)
                .dailyBreakdown(breakdown)
                .build();
    }
}
