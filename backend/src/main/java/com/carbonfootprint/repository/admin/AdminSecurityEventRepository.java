package com.carbonfootprint.repository.admin;

import com.carbonfootprint.entity.admin.AdminSecurityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminSecurityEventRepository extends JpaRepository<AdminSecurityEvent, Long> {
    List<AdminSecurityEvent> findTop10ByOrderByCreatedAtDesc();
}
