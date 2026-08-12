package com.carbonfootprint.service;

import com.carbonfootprint.dto.organization.AdminActivationDto;
import com.carbonfootprint.dto.organization.EmployeeActivationDto;

public interface OrganizationInvitationService {
    void activateAdminAccount(AdminActivationDto dto);
    void activateEmployeeAccount(EmployeeActivationDto dto);
    void acceptEmployeeInvitation(String token, String email);
}
