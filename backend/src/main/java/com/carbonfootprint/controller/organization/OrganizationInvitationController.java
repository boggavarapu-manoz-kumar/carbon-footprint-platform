package com.carbonfootprint.controller.organization;

import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.dto.organization.AdminActivationDto;
import com.carbonfootprint.dto.organization.EmployeeActivationDto;
import com.carbonfootprint.service.OrganizationInvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/invitations")
@RequiredArgsConstructor
public class OrganizationInvitationController {

    private final OrganizationInvitationService invitationService;

    @PostMapping("/activate-admin")
    public ResponseEntity<ApiResponse<Void>> activateAdmin(@Valid @RequestBody AdminActivationDto dto) {
        invitationService.activateAdminAccount(dto);
        return ResponseEntity.ok(ApiResponse.success(null, "Admin account activated successfully"));
    }

    @PostMapping("/activate-employee")
    public ResponseEntity<ApiResponse<Void>> activateEmployee(@Valid @RequestBody EmployeeActivationDto dto) {
        invitationService.activateEmployeeAccount(dto);
        return ResponseEntity.ok(ApiResponse.success(null, "Employee account activated successfully"));
    }
}
