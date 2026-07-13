package com.carbonfootprint.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminMonitoringFilterDTO {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private List<String> categories;
    private String searchUser;
    private BigDecimal minEmission;
    private BigDecimal maxEmission;
    private String activityName;
    private String sortBy; // "emissionValue", "createdAt", etc.
    private String sortDirection; // "ASC" or "DESC"
}
