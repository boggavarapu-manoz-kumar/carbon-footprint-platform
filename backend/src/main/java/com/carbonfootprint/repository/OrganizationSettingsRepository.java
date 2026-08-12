package com.carbonfootprint.repository;

import com.carbonfootprint.entity.organization.OrganizationSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationSettingsRepository extends JpaRepository<OrganizationSettings, Long> {
    Optional<OrganizationSettings> findByOrganizationId(Long organizationId);
}
