package com.carbonfootprint.repository;

import com.carbonfootprint.entity.organization.OrganizationMembership;
import com.carbonfootprint.entity.organization.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationMembershipRepository extends JpaRepository<OrganizationMembership, Long> {
    Optional<OrganizationMembership> findByOrganizationIdAndUserId(Long organizationId, Long userId);
    List<OrganizationMembership> findByOrganizationId(Long organizationId);
    List<OrganizationMembership> findByOrganizationIdAndStatus(Long organizationId, MembershipStatus status);
    List<OrganizationMembership> findByUserId(Long userId);
    boolean existsByOrganizationIdAndUserIdAndStatus(Long organizationId, Long userId, MembershipStatus status);
    
    long countByOrganizationId(Long organizationId);
    long countByOrganizationIdAndStatus(Long organizationId, MembershipStatus status);
}
