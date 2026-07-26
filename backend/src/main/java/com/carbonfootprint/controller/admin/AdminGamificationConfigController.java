package com.carbonfootprint.controller.admin;

import com.carbonfootprint.entity.GamificationConfig;
import com.carbonfootprint.entity.LevelConfig;
import com.carbonfootprint.repository.GamificationConfigRepository;
import com.carbonfootprint.repository.LevelConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/gamification/config")
@RequiredArgsConstructor
public class AdminGamificationConfigController {

    private final GamificationConfigRepository gamificationConfigRepository;
    private final LevelConfigRepository levelConfigRepository;

    // Gamification Config Endpoints

    @GetMapping("/rules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<GamificationConfig>> getAllRules() {
        return ResponseEntity.ok(gamificationConfigRepository.findAll());
    }

    @PostMapping("/rules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GamificationConfig> createRule(@RequestBody GamificationConfig config) {
        return ResponseEntity.ok(gamificationConfigRepository.save(config));
    }

    @PutMapping("/rules/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GamificationConfig> updateRule(@PathVariable Long id, @RequestBody GamificationConfig configDetails) {
        return gamificationConfigRepository.findById(id)
                .map(existingRule -> {
                    existingRule.setActionType(configDetails.getActionType());
                    existingRule.setPoints(configDetails.getPoints());
                    existingRule.setMaxDailyLimit(configDetails.getMaxDailyLimit());
                    existingRule.setIsActive(configDetails.getIsActive());
                    return ResponseEntity.ok(gamificationConfigRepository.save(existingRule));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/rules/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        if (gamificationConfigRepository.existsById(id)) {
            gamificationConfigRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Level Config Endpoints

    @GetMapping("/levels")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LevelConfig>> getAllLevels() {
        return ResponseEntity.ok(levelConfigRepository.findAllOrderByMinPointsDesc());
    }

    @PostMapping("/levels")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LevelConfig> createLevel(@RequestBody LevelConfig level) {
        return ResponseEntity.ok(levelConfigRepository.save(level));
    }

    @PutMapping("/levels/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LevelConfig> updateLevel(@PathVariable Long id, @RequestBody LevelConfig levelDetails) {
        return levelConfigRepository.findById(id)
                .map(existingLevel -> {
                    existingLevel.setLevelName(levelDetails.getLevelName());
                    existingLevel.setMinPoints(levelDetails.getMinPoints());
                    existingLevel.setMaxPoints(levelDetails.getMaxPoints());
                    return ResponseEntity.ok(levelConfigRepository.save(existingLevel));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/levels/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLevel(@PathVariable Long id) {
        if (levelConfigRepository.existsById(id)) {
            levelConfigRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
