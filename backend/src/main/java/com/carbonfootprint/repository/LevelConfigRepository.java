package com.carbonfootprint.repository;

import com.carbonfootprint.entity.LevelConfig;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LevelConfigRepository extends JpaRepository<LevelConfig, Long> {

    @Cacheable(value = "levelConfigList")
    @Query("SELECT l FROM LevelConfig l ORDER BY l.minPoints DESC")
    List<LevelConfig> findAllOrderByMinPointsDesc();
}
