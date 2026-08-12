package com.carbonfootprint.integration;

import com.carbonfootprint.dto.organization.EmployeeActivationDto;
import com.carbonfootprint.dto.organization.InviteEmployeeDto;
import com.carbonfootprint.entity.organization.InvitationStatus;
import com.carbonfootprint.entity.organization.OrganizationInvitation;
import com.carbonfootprint.entity.organization.OrganizationRole;
import com.carbonfootprint.repository.OrganizationInvitationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Organization Invitation Flow Tests")
public class OrganizationInvitationIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private OrganizationInvitationRepository invitationRepository;

    @Test
    @DisplayName("Admin invites employee - Duplicate invitation rejected")
    void testDuplicateInvitation() throws Exception {
        // Invite an employee
        InviteEmployeeDto inviteDto = new InviteEmployeeDto();
        inviteDto.setName("New Employee");
        inviteDto.setEmail("newemp@example.com");
        inviteDto.setJobTitle("Engineer");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/org/admin/" + orgA.getId() + "/employees/invite")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inviteDto)))
                .andExpect(status().isOk());

        // Invite same employee again
        mockMvc.perform(MockMvcRequestBuilders.post("/api/org/admin/" + orgA.getId() + "/employees/invite")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminAToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inviteDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Activate employee with expired token")
    void testActivateExpiredToken() throws Exception {
        OrganizationInvitation expired = OrganizationInvitation.builder()
                .organization(orgA)
                .email("expired@example.com")
                .role(OrganizationRole.ORGANIZATION_EMPLOYEE)
                .token("expired-token-123")
                .status(InvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().minusDays(1)) // expired
                .build();
        invitationRepository.save(expired);

        EmployeeActivationDto activationDto = new EmployeeActivationDto();
        activationDto.setToken("expired-token-123");
        activationDto.setFirstName("Expired");
        activationDto.setLastName("User");
        activationDto.setPassword("Pass@1234");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/public/organizations/activate/employee")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(activationDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Activate employee with invalid token")
    void testActivateInvalidToken() throws Exception {
        EmployeeActivationDto activationDto = new EmployeeActivationDto();
        activationDto.setToken("invalid-token-123");
        activationDto.setFirstName("Invalid");
        activationDto.setLastName("User");
        activationDto.setPassword("Pass@1234");

        mockMvc.perform(MockMvcRequestBuilders.post("/api/v1/public/organizations/activate/employee")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(activationDto)))
                .andExpect(status().isNotFound());
    }
}
