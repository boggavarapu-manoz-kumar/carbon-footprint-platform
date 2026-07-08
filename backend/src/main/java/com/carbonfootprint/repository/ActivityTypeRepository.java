package com.carbonfootprint.repository;

import com.carbonfootprint.entity.ActivityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActivityTypeRepository extends JpaRepository<ActivityType, Long> {
    Optional<ActivityType> findByCode(String code);
    java.util.List<ActivityType> findByCodeIn(java.util.Collection<String> codes);
}
