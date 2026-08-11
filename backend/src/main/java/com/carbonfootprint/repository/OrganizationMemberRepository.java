package com.carbonfootprint.repository;

import com.carbonfootprint.entity.OrganizationMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {
    List<OrganizationMember> findByOrganizationId(Long organizationId);
    List<OrganizationMember> findByOrganizationIdAndStatus(Long organizationId, String status);
    Optional<OrganizationMember> findByOrganizationIdAndUserId(Long organizationId, Long userId);
    List<OrganizationMember> findByUserId(Long userId);
    long countByOrganizationId(Long organizationId);
    long countByOrganizationIdAndStatus(Long organizationId, String status);

    @Query("SELECT m FROM OrganizationMember m WHERE m.organization.id = :orgId AND " +
           "(:search IS NULL OR LOWER(m.user.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.user.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(m.user.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<OrganizationMember> searchMembers(@Param("orgId") Long orgId, @Param("search") String search, Pageable pageable);
}
