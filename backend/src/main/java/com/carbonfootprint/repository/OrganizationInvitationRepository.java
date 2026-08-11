package com.carbonfootprint.repository;

import com.carbonfootprint.entity.OrganizationInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationInvitationRepository extends JpaRepository<OrganizationInvitation, Long> {
    Optional<OrganizationInvitation> findByToken(String token);
    List<OrganizationInvitation> findByOrganizationId(Long organizationId);
    Optional<OrganizationInvitation> findByOrganizationIdAndEmailAndStatus(Long organizationId, String email, String status);
    long countByOrganizationIdAndStatus(Long organizationId, String status);
}
