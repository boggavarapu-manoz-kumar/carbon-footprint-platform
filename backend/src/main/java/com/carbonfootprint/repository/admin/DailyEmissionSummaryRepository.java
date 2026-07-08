package com.carbonfootprint.repository.admin;

import com.carbonfootprint.entity.admin.DailyEmissionSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyEmissionSummaryRepository extends JpaRepository<DailyEmissionSummary, LocalDate> {
    List<DailyEmissionSummary> findByLogDateGreaterThanEqualOrderByLogDateAsc(LocalDate startDate);
}
