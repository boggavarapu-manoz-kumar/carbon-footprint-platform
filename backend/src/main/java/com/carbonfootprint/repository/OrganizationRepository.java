package com.carbonfootprint.repository;

import com.carbonfootprint.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByOrganizationCode(String organizationCode);
    boolean existsByName(String name);
}
