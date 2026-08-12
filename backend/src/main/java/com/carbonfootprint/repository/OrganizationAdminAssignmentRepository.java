package com.carbonfootprint.repository;

import com.carbonfootprint.entity.organization.OrganizationAdminAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationAdminAssignmentRepository extends JpaRepository<OrganizationAdminAssignment, Long> {
    Optional<OrganizationAdminAssignment> findByOrganizationIdAndUserId(Long organizationId, Long userId);
    List<OrganizationAdminAssignment> findByOrganizationId(Long organizationId);
    List<OrganizationAdminAssignment> findByUserId(Long userId);
    boolean existsByOrganizationIdAndUserId(Long organizationId, Long userId);
}
