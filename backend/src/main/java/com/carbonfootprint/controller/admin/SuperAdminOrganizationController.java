package com.carbonfootprint.controller.admin;

import com.carbonfootprint.dto.organization.CreateOrganizationDto;
import com.carbonfootprint.dto.organization.OrganizationDto;
import com.carbonfootprint.entity.organization.OrganizationStatus;
import com.carbonfootprint.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/organizations")
@RequiredArgsConstructor
public class SuperAdminOrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    public ResponseEntity<OrganizationDto> createOrganization(@Valid @RequestBody CreateOrganizationDto dto) {
        OrganizationDto created = organizationService.createOrganization(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<OrganizationDto>> getAllOrganizations() {
        return ResponseEntity.ok(organizationService.getAllOrganizations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrganizationDto> getOrganization(@PathVariable Long id) {
        return ResponseEntity.ok(organizationService.getOrganization(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrganizationDto> updateOrganizationStatus(
            @PathVariable Long id,
            @RequestParam OrganizationStatus status) {
        return ResponseEntity.ok(organizationService.updateOrganizationStatus(id, status));
    }

    @PostMapping("/{id}/assign-admin")
    public ResponseEntity<Void> assignAdmin(
            @PathVariable Long id,
            @RequestParam Long userId) {
        organizationService.assignOrganizationAdmin(id, userId);
        return ResponseEntity.ok().build();
    }
}
