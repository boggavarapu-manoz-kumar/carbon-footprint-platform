package com.carbonfootprint.repository;

import com.carbonfootprint.entity.ActivitySubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActivitySubCategoryRepository extends JpaRepository<ActivitySubCategory, Long> {
    Optional<ActivitySubCategory> findByCode(String code);
}
