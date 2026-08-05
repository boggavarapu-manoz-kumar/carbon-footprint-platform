package com.carbonfootprint.repository;

import com.carbonfootprint.entity.PinnedActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PinnedActivityRepository extends JpaRepository<PinnedActivity, Long> {
    List<PinnedActivity> findByUserId(Long userId);
    
    Optional<PinnedActivity> findByUserIdAndActivityTypeIdAndDynamicInputs(Long userId, Long activityTypeId, String dynamicInputs);
    
    Optional<PinnedActivity> findByUserIdAndId(Long userId, Long id);
}
