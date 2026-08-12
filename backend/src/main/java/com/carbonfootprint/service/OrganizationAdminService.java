package com.carbonfootprint.service;

import com.carbonfootprint.dto.organization.InviteEmployeeDto;

public interface OrganizationAdminService {
    void inviteEmployee(Long organizationId, InviteEmployeeDto dto);
}
