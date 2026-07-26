package com.carbonfootprint.repository;

import com.carbonfootprint.entity.GamificationConfig;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GamificationConfigRepository extends JpaRepository<GamificationConfig, Long> {
    
    @Cacheable(value = "gamificationConfig", key = "#actionType")
    Optional<GamificationConfig> findByActionType(String actionType);
}
