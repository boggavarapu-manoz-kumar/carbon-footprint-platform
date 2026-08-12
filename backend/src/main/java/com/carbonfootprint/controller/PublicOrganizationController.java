package com.carbonfootprint.controller;

import com.carbonfootprint.dto.organization.AdminActivationDto;
import com.carbonfootprint.service.OrganizationInvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/organization")
@RequiredArgsConstructor
public class PublicOrganizationController {

    private final OrganizationInvitationService invitationService;

    @PostMapping("/activate")
    public ResponseEntity<Void> activateAdminAccount(@Valid @RequestBody AdminActivationDto dto) {
        invitationService.activateAdminAccount(dto);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/employee/activate")
    public ResponseEntity<Void> activateEmployeeAccount(@Valid @RequestBody com.carbonfootprint.dto.organization.EmployeeActivationDto dto) {
        invitationService.activateEmployeeAccount(dto);
        return ResponseEntity.ok().build();
    }
    
    // For logged-in users who click an invitation link
    @PostMapping("/employee/accept")
    public ResponseEntity<Void> acceptEmployeeInvitation(
            @org.springframework.web.bind.annotation.RequestParam String token, 
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        
        // Find user by email from UserDetails
        invitationService.acceptEmployeeInvitation(token, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}
