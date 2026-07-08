package com.carbonfootprint.repository.admin;

import com.carbonfootprint.entity.admin.DashboardMetricsSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DashboardMetricsSummaryRepository extends JpaRepository<DashboardMetricsSummary, Long> {
}
