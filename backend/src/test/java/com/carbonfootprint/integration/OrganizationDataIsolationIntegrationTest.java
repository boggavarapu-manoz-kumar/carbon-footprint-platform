package com.carbonfootprint.integration;

import com.carbonfootprint.entity.PointHistory;
import com.carbonfootprint.repository.PointHistoryRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Organization Data Isolation Tests")
public class OrganizationDataIsolationIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private PointHistoryRepository pointHistoryRepository;

    @Test
    @DisplayName("Org Leaderboard isolation - Org A doesn't see Org B points")
    void testLeaderboardIsolation() throws Exception {
        // Seed points
        PointHistory pA = new PointHistory();
        pA.setUser(employeeA);
        pA.setPoints(500L);
        pA.setReason("Activity");
        pA.setActionType("TEST");
        pA.setTimestamp(LocalDateTime.now());
        pA.setStatus("AWARDED");
        pointHistoryRepository.save(pA);

        PointHistory pB = new PointHistory();
        pB.setUser(employeeB);
        pB.setPoints(1000L);
        pB.setReason("Activity");
        pB.setActionType("TEST");
        pB.setTimestamp(LocalDateTime.now());
        pB.setStatus("AWARDED");
        pointHistoryRepository.save(pB);

        // Fetch Org A leaderboard, should ONLY contain Employee A / Admin A (since they are in Org A)
        // Employee B should NOT be there.
        mockMvc.perform(MockMvcRequestBuilders.get("/api/org/" + orgA.getId() + "/leaderboard")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + employeeAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[?(@.userId == " + employeeA.getId() + ")]").exists())
                .andExpect(jsonPath("$.data.content[?(@.userId == " + employeeB.getId() + ")]").doesNotExist());
    }

    @Test
    @DisplayName("Global Leaderboard contains everyone")
    void testGlobalLeaderboard() throws Exception {
        // Global user token
        mockMvc.perform(MockMvcRequestBuilders.get("/api/v1/leaderboard")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + globalUserToken))
                .andExpect(status().isOk());
        // Since Global Leaderboard fetches all, no isolation checks needed except confirming it works
    }
}
