package com.carbonfootprint.service;

import com.carbonfootprint.dto.organization.CreateOrganizationDto;
import com.carbonfootprint.dto.organization.OrganizationDto;
import com.carbonfootprint.entity.organization.OrganizationStatus;

import java.util.List;

public interface OrganizationService {
    OrganizationDto createOrganization(CreateOrganizationDto dto);
    OrganizationDto getOrganization(Long id);
    List<OrganizationDto> getAllOrganizations();
    OrganizationDto updateOrganizationStatus(Long id, OrganizationStatus status);
    void assignOrganizationAdmin(Long organizationId, Long userId);
}
