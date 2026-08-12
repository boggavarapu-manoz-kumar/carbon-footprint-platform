package com.carbonfootprint.integration;

import com.carbonfootprint.entity.AuthProvider;
import com.carbonfootprint.entity.Role;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.entity.organization.MembershipStatus;
import com.carbonfootprint.entity.organization.Organization;
import com.carbonfootprint.entity.organization.OrganizationAdminAssignment;
import com.carbonfootprint.entity.organization.OrganizationMembership;
import com.carbonfootprint.entity.organization.OrganizationRole;
import com.carbonfootprint.entity.organization.OrganizationStatus;
import com.carbonfootprint.repository.OrganizationAdminAssignmentRepository;
import com.carbonfootprint.repository.OrganizationMembershipRepository;
import com.carbonfootprint.repository.OrganizationRepository;
import com.carbonfootprint.repository.PointHistoryRepository;
import com.carbonfootprint.repository.TokenRepository;
import com.carbonfootprint.repository.OrganizationInvitationRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.security.JwtService;
import com.carbonfootprint.entity.Token;
import com.carbonfootprint.entity.TokenType;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected OrganizationRepository organizationRepository;

    @Autowired
    protected OrganizationMembershipRepository membershipRepository;

    @Autowired
    protected PointHistoryRepository pointHistoryRepository;

    @Autowired
    protected OrganizationInvitationRepository invitationRepository;

    @Autowired
    protected OrganizationAdminAssignmentRepository adminAssignmentRepository;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Autowired
    protected JwtService jwtService;

    @Autowired
    protected TokenRepository tokenRepository;

    // Test Data
    protected User superAdmin;
    protected User adminA;
    protected User adminB;
    protected User employeeA;
    protected User employeeB;
    protected User globalUser;

    protected Organization orgA;
    protected Organization orgB;

    protected String adminAToken;
    protected String adminBToken;
    protected String employeeAToken;
    protected String employeeBToken;
    protected String globalUserToken;

    @BeforeEach
    public void setupData() {
        // Clear data
        tokenRepository.deleteAll();
        pointHistoryRepository.deleteAll();
        invitationRepository.deleteAll();
        adminAssignmentRepository.deleteAll();
        membershipRepository.deleteAll();
        organizationRepository.deleteAll();
        userRepository.deleteAll();

        // 1. Create Super Admin (creator of Orgs)
        superAdmin = createUser("super@platform.com", "Super", "Admin", Role.SUPER_ADMIN);

        // 2. Create Orgs
        orgA = createOrganization("Organization A", superAdmin);
        orgB = createOrganization("Organization B", superAdmin);

        // 3. Create Users
        adminA = createUser("admina@orga.com", "Admin", "A", Role.USER);
        adminB = createUser("adminb@orgb.com", "Admin", "B", Role.USER);
        employeeA = createUser("empa@orga.com", "Employee", "A", Role.USER);
        employeeB = createUser("empb@orgb.com", "Employee", "B", Role.USER);
        globalUser = createUser("global@example.com", "Global", "User", Role.USER);

        // 4. Assign Memberships
        createMembershipAndAdmin(orgA, adminA, OrganizationRole.ORGANIZATION_ADMIN);
        createMembershipAndAdmin(orgB, adminB, OrganizationRole.ORGANIZATION_ADMIN);
        
        createMembership(orgA, employeeA, OrganizationRole.ORGANIZATION_EMPLOYEE);
        createMembership(orgB, employeeB, OrganizationRole.ORGANIZATION_EMPLOYEE);

        // 5. Generate Tokens
        adminAToken = createAndSaveToken(adminA);
        adminBToken = createAndSaveToken(adminB);
        employeeAToken = createAndSaveToken(employeeA);
        employeeBToken = createAndSaveToken(employeeB);
        globalUserToken = createAndSaveToken(globalUser);
    }

    private String createAndSaveToken(User user) {
        String jwt = jwtService.generateToken(user);
        Token token = Token.builder()
                .user(user)
                .token(jwt)
                .tokenType(TokenType.BEARER)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(token);
        return jwt;
    }

    private User createUser(String email, String first, String last, Role role) {
        User user = User.builder()
                .email(email)
                .firstName(first)
                .lastName(last)
                .username(email.split("@")[0])
                .password(passwordEncoder.encode("Password123!"))
                .role(role)
                .provider(AuthProvider.LOCAL)
                .isSuspended(false)
                .build();
        return userRepository.save(user);
    }

    private Organization createOrganization(String name, User creator) {
        Organization org = Organization.builder()
                .name(name)
                .status(OrganizationStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .createdBy(creator.getId())
                .build();
        return organizationRepository.save(org);
    }

    private void createMembership(Organization org, User user, OrganizationRole role) {
        OrganizationMembership membership = OrganizationMembership.builder()
                .organization(org)
                .user(user)
                .role(role)
                .status(MembershipStatus.ACTIVE)
                .joinedAt(LocalDateTime.now())
                .build();
        membershipRepository.save(membership);
    }

    private void createMembershipAndAdmin(Organization org, User user, OrganizationRole role) {
        createMembership(org, user, role);
        OrganizationAdminAssignment adminAssignment = OrganizationAdminAssignment.builder()
                .organization(org)
                .user(user)
                .assignedBy(org.getCreatedBy())
                .build();
        adminAssignmentRepository.save(adminAssignment);
    }
}
