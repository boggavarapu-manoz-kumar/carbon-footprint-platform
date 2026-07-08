package com.carbonfootprint.repository.admin;

import com.carbonfootprint.entity.admin.UserEmissionSummary;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserEmissionSummaryRepository extends JpaRepository<UserEmissionSummary, Long> {
    List<UserEmissionSummary> findAllByOrderByTotalEmissionDesc(Pageable pageable);
}
