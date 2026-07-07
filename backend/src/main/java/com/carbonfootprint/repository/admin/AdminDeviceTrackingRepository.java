package com.carbonfootprint.repository.admin;

import com.carbonfootprint.entity.admin.AdminDeviceTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminDeviceTrackingRepository extends JpaRepository<AdminDeviceTracking, Long> {
    Optional<AdminDeviceTracking> findByAdminUser_IdAndDeviceFingerprint(String adminId, String deviceFingerprint);
}
