package com.carbonfootprint.config;

import com.carbonfootprint.entity.admin.AdminUser;
import com.carbonfootprint.repository.admin.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@Order(2)
@RequiredArgsConstructor
public class AdminUserSeeder implements CommandLineRunner {

    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;

    public static final String DEFAULT_ADMIN_EMAIL = "superadmin@carbonfootprint.com";
    public static final String DEFAULT_ADMIN_PASSWORD = "admin123";

    @Override
    public void run(String... args) {
        try {
            var existingAdminOpt = adminUserRepository.findByEmail(DEFAULT_ADMIN_EMAIL);
            if (existingAdminOpt.isEmpty()) {
                AdminUser superAdmin = AdminUser.builder()
                        .id("00000000-0000-0000-0000-000000000001")
                        .email(DEFAULT_ADMIN_EMAIL)
                        .password(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD))
                        .isActive(true)
                        .build();
                adminUserRepository.save(superAdmin);
                log.info("Initialized default Super Admin account: {}", DEFAULT_ADMIN_EMAIL);
            } else {
                AdminUser existingAdmin = existingAdminOpt.get();
                if (!passwordEncoder.matches(DEFAULT_ADMIN_PASSWORD, existingAdmin.getPassword())) {
                    existingAdmin.setPassword(passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD));
                    existingAdmin.setActive(true);
                    adminUserRepository.save(existingAdmin);
                    log.info("Updated password hash for default Super Admin: {}", DEFAULT_ADMIN_EMAIL);
                }
            }
        } catch (Exception e) {
            log.warn("Non-fatal: AdminUserSeeder could not initialize superadmin: {}", e.getMessage());
        }
    }
}
