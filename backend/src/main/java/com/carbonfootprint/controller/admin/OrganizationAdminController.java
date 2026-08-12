package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.organization.InviteEmployeeDto;
import com.carbonfootprint.service.OrganizationAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/org/admin/{organizationId}/employees")
@RequiredArgsConstructor
public class OrganizationAdminController {

    private final OrganizationAdminService organizationAdminService;

    @PostMapping("/invite")
    public ResponseEntity<Void> inviteEmployee(
            @PathVariable Long organizationId,
            @Valid @RequestBody InviteEmployeeDto dto) {
        organizationAdminService.inviteEmployee(organizationId, dto);
        return ResponseEntity.ok().build();
    }
}
