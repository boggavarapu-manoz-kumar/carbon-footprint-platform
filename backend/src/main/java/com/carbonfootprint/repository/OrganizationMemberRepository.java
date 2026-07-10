package com.carbonfootprint.repository;

import com.carbonfootprint.entity.OrganizationMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrganizationMemberRepository extends JpaRepository<OrganizationMember, Long> {
    List<OrganizationMember> findByOrganizationId(Long organizationId);
    List<OrganizationMember> findByUserId(Long userId);
    long countByOrganizationId(Long organizationId);
}
