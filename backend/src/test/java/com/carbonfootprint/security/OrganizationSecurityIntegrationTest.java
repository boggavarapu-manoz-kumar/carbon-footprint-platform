package com.carbonfootprint.security;

import com.carbonfootprint.controller.OrganizationController;
import com.carbonfootprint.dto.organization.OrganizationCreateDto;
import com.carbonfootprint.entity.Organization;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.OrganizationRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.OrganizationSecurityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class OrganizationSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrganizationController organizationController;

    @Autowired
    private com.carbonfootprint.repository.OrganizationMemberRepository organizationMemberRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationSecurityService securityService;

    private User userA;
    private User userB;
    private User employeeA;
    private Long orgA_Id;
    private Long orgB_Id;

    @BeforeEach
    void setUp() {
        // Setup User A (Admin of Org A)
        userA = new User();
        userA.setEmail("adminA@orga.com");
        userA.setFirstName("Admin");
        userA.setLastName("A");
        userA.setUsername("admina");
        userA.setMobileNumber("1234567890");
        userA.setRole(com.carbonfootprint.entity.Role.USER);
        userA.setPassword("mock");
        userA = userRepository.save(userA);

        OrganizationCreateDto dtoA = new OrganizationCreateDto();
        dtoA.setName("Organization A");
        orgA_Id = organizationController.createOrganization(dtoA, userA).getBody().getId();

        // Setup Employee A
        employeeA = new User();
        employeeA.setEmail("employeeA@orga.com");
        employeeA.setFirstName("Employee");
        employeeA.setLastName("A");
        employeeA.setUsername("employeea");
        employeeA.setMobileNumber("1122334455");
        employeeA.setRole(com.carbonfootprint.entity.Role.USER);
        employeeA.setPassword("mock");
        employeeA = userRepository.save(employeeA);

        com.carbonfootprint.entity.Organization orgA = organizationRepository.findById(orgA_Id).get();
        com.carbonfootprint.entity.OrganizationMember memA = com.carbonfootprint.entity.OrganizationMember.builder()
                .organization(orgA)
                .user(employeeA)
                .role(com.carbonfootprint.entity.OrganizationRole.EMPLOYEE)
                .status("ACTIVE")
                .build();
        // Since we don't have the repo autowired, I'll add the autowired member repo at top
        organizationMemberRepository.save(memA);

        // Setup User B (Admin of Org B)
        userB = new User();
        userB.setEmail("adminB@orgb.com");
        userB.setFirstName("Admin");
        userB.setLastName("B");
        userB.setUsername("adminb");
        userB.setMobileNumber("0987654321");
        userB.setRole(com.carbonfootprint.entity.Role.USER);
        userB.setPassword("mock");
        userB = userRepository.save(userB);

        OrganizationCreateDto dtoB = new OrganizationCreateDto();
        dtoB.setName("Organization B");
        orgB_Id = organizationController.createOrganization(dtoB, userB).getBody().getId();
    }

    @Test
    @org.springframework.security.test.context.support.WithUserDetails(value = "adminA@orga.com", userDetailsServiceBeanName = "userDetailsService", setupBefore = org.springframework.security.test.context.support.TestExecutionEvent.TEST_EXECUTION)
    void adminACanAccessOrgA_CannotAccessOrgB() throws Exception {
        // MVC Check for Org A (Expect 200 OK)
        mockMvc.perform(get("/api/v1/organizations/" + orgA_Id + "/analytics"))
               .andExpect(status().isOk());

        // MVC Check for Org B (Expect 403 Forbidden)
        mockMvc.perform(get("/api/v1/organizations/" + orgB_Id + "/analytics"))
               .andExpect(status().isForbidden());
    }

    @Test
    @org.springframework.security.test.context.support.WithUserDetails(value = "adminB@orgb.com", userDetailsServiceBeanName = "userDetailsService", setupBefore = org.springframework.security.test.context.support.TestExecutionEvent.TEST_EXECUTION)
    void adminBCanAccessOrgB_CannotAccessOrgA() throws Exception {
        // MVC Check for Org B (Expect 200 OK)
        mockMvc.perform(get("/api/v1/organizations/" + orgB_Id + "/analytics"))
               .andExpect(status().isOk());

        // MVC Check for Org A (Expect 403 Forbidden)
        mockMvc.perform(get("/api/v1/organizations/" + orgA_Id + "/analytics"))
               .andExpect(status().isForbidden());
    }

    @Test
    @org.springframework.security.test.context.support.WithUserDetails(value = "employeeA@orga.com", userDetailsServiceBeanName = "userDetailsService", setupBefore = org.springframework.security.test.context.support.TestExecutionEvent.TEST_EXECUTION)
    void employeeACannotInviteOrViewAnalytics() throws Exception {
        // Can View Org
        mockMvc.perform(get("/api/v1/organizations/" + orgA_Id))
               .andExpect(status().isOk());

        // Cannot Invite
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/api/v1/organizations/" + orgA_Id + "/invitations")
               .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
               .content("{\"email\":\"new@orga.com\",\"department\":\"IT\",\"jobTitle\":\"Dev\"}"))
               .andExpect(status().isForbidden());
               
        // Cannot View Analytics
        mockMvc.perform(get("/api/v1/organizations/" + orgA_Id + "/analytics"))
               .andExpect(status().isForbidden());
    }

    @Test
    @org.springframework.security.test.context.support.WithUserDetails(value = "adminA@orga.com", userDetailsServiceBeanName = "userDetailsService", setupBefore = org.springframework.security.test.context.support.TestExecutionEvent.TEST_EXECUTION)
    void adminACanManageMembersOfOrgA() throws Exception {
        // Can View Members
        mockMvc.perform(get("/api/v1/organizations/" + orgA_Id + "/members"))
               .andExpect(status().isOk());
               
        // Cannot View Members of Org B
        mockMvc.perform(get("/api/v1/organizations/" + orgB_Id + "/members"))
               .andExpect(status().isForbidden());
    }
}
