package com.carbonfootprint.repository;

import com.carbonfootprint.entity.ActivityCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActivityCategoryRepository extends JpaRepository<ActivityCategory, Long> {
    Optional<ActivityCategory> findByCode(String code);
}
