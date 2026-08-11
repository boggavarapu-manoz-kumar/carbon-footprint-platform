package com.carbonfootprint.controller;

import com.carbonfootprint.dto.organization.OrganizationCreateDto;
import com.carbonfootprint.dto.organization.OrganizationInvitationDto;
import com.carbonfootprint.entity.Organization;
import com.carbonfootprint.entity.OrganizationMember;
import com.carbonfootprint.entity.OrganizationRole;
import com.carbonfootprint.entity.Role;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.OrganizationInvitationRepository;
import com.carbonfootprint.repository.OrganizationMemberRepository;
import com.carbonfootprint.repository.OrganizationRepository;
import com.carbonfootprint.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.TestExecutionEvent;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class OrganizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrganizationController organizationController;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationMemberRepository organizationMemberRepository;

    @Autowired
    private OrganizationInvitationRepository organizationInvitationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User owner;
    private User employee;
    private User newEmployee;
    private Long orgId;

    @BeforeEach
    void setUp() {
        owner = new User();
        owner.setEmail("audit_owner@example.com");
        owner.setFirstName("Audit");
        owner.setLastName("Owner");
        owner.setUsername("auditowner");
        owner.setMobileNumber("1000000001");
        owner.setRole(Role.USER);
        owner.setPassword("password");
        owner = userRepository.save(owner);

        employee = new User();
        employee.setEmail("audit_emp@example.com");
        employee.setFirstName("Audit");
        employee.setLastName("Employee");
        employee.setUsername("auditemployee");
        employee.setMobileNumber("1000000002");
        employee.setRole(Role.USER);
        employee.setPassword("password");
        employee = userRepository.save(employee);
        
        newEmployee = new User();
        newEmployee.setEmail("audit_new@example.com");
        newEmployee.setFirstName("Audit");
        newEmployee.setLastName("New");
        newEmployee.setUsername("auditnew");
        newEmployee.setMobileNumber("1000000003");
        newEmployee.setRole(Role.USER);
        newEmployee.setPassword("password");
        newEmployee = userRepository.save(newEmployee);

        OrganizationCreateDto createDto = new OrganizationCreateDto();
        createDto.setName("Audit Organization");
        createDto.setIndustry("Technology");
        createDto.setCompanySize("10-50");
        createDto.setCountry("USA");

        orgId = organizationController.createOrganization(createDto, owner).getBody().getId();
        
        Organization org = organizationRepository.findById(orgId).get();
        OrganizationMember empMem = OrganizationMember.builder()
                .organization(org)
                .user(employee)
                .role(OrganizationRole.EMPLOYEE)
                .status("ACTIVE")
                .build();
        organizationMemberRepository.save(empMem);
    }

    @Test
    @WithUserDetails(value = "audit_owner@example.com", userDetailsServiceBeanName = "userDetailsService", setupBefore = TestExecutionEvent.TEST_EXECUTION)
    void testOrganizationOverview() throws Exception {
        mockMvc.perform(get("/api/v1/organizations/" + orgId + "/overview"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(orgId))
               .andExpect(jsonPath("$.name").value("Audit Organization"))
               .andExpect(jsonPath("$.memberCount").value(2));
    }

    @Test
    @WithUserDetails(value = "audit_owner@example.com", userDetailsServiceBeanName = "userDetailsService", setupBefore = TestExecutionEvent.TEST_EXECUTION)
    void testCreateDuplicateOrganizationName() throws Exception {
        OrganizationCreateDto createDto = new OrganizationCreateDto();
        createDto.setName("Audit Organization");
        createDto.setIndustry("Retail");

        mockMvc.perform(post("/api/v1/organizations")
               .contentType(MediaType.APPLICATION_JSON)
               .content(objectMapper.writeValueAsString(createDto)))
               .andExpect(status().isBadRequest());
    }

    @Test
    @WithUserDetails(value = "audit_owner@example.com", userDetailsServiceBeanName = "userDetailsService", setupBefore = TestExecutionEvent.TEST_EXECUTION)
    void testInviteExistingUser() throws Exception {
        OrganizationInvitationDto inviteDto = new OrganizationInvitationDto();
        inviteDto.setEmail("audit_new@example.com");
        inviteDto.setDepartment("Engineering");
        inviteDto.setJobTitle("Software Engineer");

        mockMvc.perform(post("/api/v1/organizations/" + orgId + "/invitations")
               .contentType(MediaType.APPLICATION_JSON)
               .content(objectMapper.writeValueAsString(inviteDto)))
               .andExpect(status().isOk());
               
        // Check duplicate protection
        mockMvc.perform(post("/api/v1/organizations/" + orgId + "/invitations")
               .contentType(MediaType.APPLICATION_JSON)
               .content(objectMapper.writeValueAsString(inviteDto)))
               .andExpect(status().isBadRequest());
    }

    @Test
    @WithUserDetails(value = "audit_owner@example.com", userDetailsServiceBeanName = "userDetailsService", setupBefore = TestExecutionEvent.TEST_EXECUTION)
    void testGetMyOrganizations() throws Exception {
        mockMvc.perform(get("/api/v1/organizations/my"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$", hasSize(1)))
               .andExpect(jsonPath("$[0].name").value("Audit Organization"));
    }

    @Test
    @WithUserDetails(value = "audit_emp@example.com", userDetailsServiceBeanName = "userDetailsService", setupBefore = TestExecutionEvent.TEST_EXECUTION)
    void testEmployeeCannotInvite() throws Exception {
        OrganizationInvitationDto inviteDto = new OrganizationInvitationDto();
        inviteDto.setEmail("test_another@example.com");

        mockMvc.perform(post("/api/v1/organizations/" + orgId + "/invitations")
               .contentType(MediaType.APPLICATION_JSON)
               .content(objectMapper.writeValueAsString(inviteDto)))
               .andExpect(status().isForbidden());
    }
}
