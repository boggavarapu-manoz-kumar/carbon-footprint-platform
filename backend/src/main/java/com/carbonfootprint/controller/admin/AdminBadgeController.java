package com.carbonfootprint.controller.admin;

import com.carbonfootprint.entity.Badge;
import com.carbonfootprint.entity.BadgeStatus;
import com.carbonfootprint.repository.BadgeRepository;
import com.carbonfootprint.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.Arrays;
import java.util.Objects;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/badges")
@RequiredArgsConstructor
public class AdminBadgeController {

    private final BadgeRepository badgeRepository;

    @Value("${app.upload.dir:uploads/badges}")
    private String uploadDir;

    @GetMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_VIEW) or hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Badge>>> getAllBadges() {
        log.info("Fetching all badges for admin");
        return ResponseEntity.ok(ApiResponse.success(badgeRepository.findAll(), "Badges retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_UPDATE) or hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Badge>> createBadge(@RequestBody Badge badge) {
        log.info("Creating new badge: {}", badge.getName());
        badge.setStatus(BadgeStatus.ACTIVE);
        Badge saved = badgeRepository.save(badge);
        return ResponseEntity.ok(ApiResponse.success(saved, "Badge created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_UPDATE) or hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Badge>> updateBadge(@PathVariable Long id, @RequestBody Badge updates) {
        log.info("Updating badge: {}", id);
        Badge existing = badgeRepository.findById(id).orElseThrow(() -> new RuntimeException("Badge not found"));
        
        existing.setName(updates.getName());
        existing.setDescription(updates.getDescription());
        existing.setRuleType(updates.getRuleType());
        existing.setRuleTarget(updates.getRuleTarget());
        existing.setCriteria(updates.getCriteria());
        existing.setImageUrl(updates.getImageUrl());
        existing.setIcon(updates.getIcon());
        existing.setColor(updates.getColor());
        existing.setCategory(updates.getCategory());
        existing.setDifficulty(updates.getDifficulty());
        existing.setPoints(updates.getPoints());
        existing.setBadgeType(updates.getBadgeType());
        existing.setVisibility(updates.getVisibility());
        
        Badge saved = badgeRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success(saved, "Badge updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_UPDATE) or hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteBadge(@PathVariable Long id) {
        log.info("Deleting badge: {}", id);
        badgeRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Badge deleted successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_UPDATE) or hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Badge>> updateBadgeStatus(@PathVariable Long id, @RequestParam BadgeStatus status) {
        log.info("Updating badge {} status to {}", id, status);
        Badge existing = badgeRepository.findById(id).orElseThrow(() -> new RuntimeException("Badge not found"));
        existing.setStatus(status);
        return ResponseEntity.ok(ApiResponse.success(badgeRepository.save(existing), "Badge status updated successfully"));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAuthority(T(com.carbonfootprint.security.admin.AdminPermissions).SETTINGS_UPDATE) or hasRole('SUPER_ADMIN') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> uploadBadgeImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
            }

            // Validate extension (PNG, SVG, WEBP)
            String filename = file.getOriginalFilename();
            if (filename == null) filename = "image.png";
            String extension = filename.substring(filename.lastIndexOf(".")).toLowerCase();
            if (!Arrays.asList(".png", ".svg", ".webp").contains(extension)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Only PNG, SVG, and WEBP files are allowed"));
            }

            // Create directory if not exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String newFilename = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(newFilename);
            Files.copy(file.getInputStream(), filePath);

            String fileUrl = "/uploads/badges/" + newFilename;
            return ResponseEntity.ok(ApiResponse.success(fileUrl, "File uploaded successfully"));
        } catch (IOException e) {
            log.error("Failed to upload file", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to upload file"));
        }
    }
}
