package com.carbonfootprint.repository;

import com.carbonfootprint.entity.GamificationSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GamificationSettingsRepository extends JpaRepository<GamificationSettings, Long> {
    Optional<GamificationSettings> findBySettingKey(String settingKey);
}
