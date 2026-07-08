package com.carbonfootprint.entity.admin;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "dashboard_metrics_summary")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricsSummary {
    @Id
    private Long id; // Will always be 1
    
    private Long totalUsers;
    private Long activeUsers;
    private Long newRegistrations;
    private BigDecimal totalEmissions;
    private Long totalActivities;
    private Long suspendedUsers;
    private Long securityAlerts;
    private Long adminCount;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
