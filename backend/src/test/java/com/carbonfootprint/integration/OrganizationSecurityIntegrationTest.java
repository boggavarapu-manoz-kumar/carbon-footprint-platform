package com.carbonfootprint.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Organization Security & IDOR Tests")
public class OrganizationSecurityIntegrationTest extends BaseIntegrationTest {

    @Test
    @DisplayName("Admin A -> Org A Analytics (Allowed)")
    void testAdminAAccessOrgA() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/organizations/" + orgA.getId() + "/analytics")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminAToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Admin A -> Org B Analytics (Denied)")
    void testAdminAAccessOrgB() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/organizations/" + orgB.getId() + "/analytics")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminAToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin B -> Org B Analytics (Allowed)")
    void testAdminBAccessOrgB() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/organizations/" + orgB.getId() + "/analytics")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminBToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Admin B -> Org A Analytics (Denied)")
    void testAdminBAccessOrgA() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/organizations/" + orgA.getId() + "/analytics")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminBToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Employee A -> Org A Leaderboard (Allowed)")
    void testEmployeeAAccessOrgALeaderboard() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/org/" + orgA.getId() + "/leaderboard")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + employeeAToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Employee A -> Org B Leaderboard (Denied)")
    void testEmployeeAAccessOrgBLeaderboard() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/org/" + orgB.getId() + "/leaderboard")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + employeeAToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Employee A -> Org A Analytics (Denied - Only Admins)")
    void testEmployeeAAccessOrgAAnalytics() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/organizations/" + orgA.getId() + "/analytics")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + employeeAToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Manipulated OrganizationId in Path Variable (Denied)")
    void testManipulatedOrganizationId() throws Exception {
        mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/organizations/99999/analytics")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminAToken))
                .andExpect(status().isForbidden());
    }
}
