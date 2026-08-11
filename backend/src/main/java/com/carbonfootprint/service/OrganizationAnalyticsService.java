package com.carbonfootprint.service;

import com.carbonfootprint.entity.ActivityLog;
import com.carbonfootprint.entity.OrganizationMember;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.OrganizationMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationAnalyticsService {

    private final OrganizationMemberRepository organizationMemberRepository;
    private final ActivityLogRepository activityLogRepository;

    private static final int PRIVACY_THRESHOLD = 3;

    @Transactional(readOnly = true)
    public Map<String, Object> getOrganizationMetrics(Long organizationId) {
        List<OrganizationMember> allMembers = organizationMemberRepository.findByOrganizationId(organizationId);
        long totalMembers = allMembers.size();
        
        List<OrganizationMember> activeMembersList = allMembers.stream()
                .filter(m -> "ACTIVE".equals(m.getStatus()))
                .collect(Collectors.toList());
        long activeMembers = activeMembersList.size();

        // Privacy Cohort Rule
        if (activeMembers < PRIVACY_THRESHOLD) {
            return generateMaskedResponse(totalMembers, activeMembers);
        }

        double totalCarbonFootprint = 0;
        long totalActivities = 0;
        Map<String, Double> departmentEmissions = new HashMap<>();

        for (OrganizationMember member : activeMembersList) {
            java.math.BigDecimal userEmissions = activityLogRepository.sumEmissionsByUserId(member.getUser().getId());
            double memberTotal = userEmissions != null ? userEmissions.doubleValue() : 0.0;
            
            Long userActivities = activityLogRepository.countByUserId(member.getUser().getId());
            
            totalCarbonFootprint += memberTotal;
            totalActivities += (userActivities != null ? userActivities : 0);

            String dept = member.getDepartment() != null && !member.getDepartment().trim().isEmpty() 
                    ? member.getDepartment() : "Unassigned";
            departmentEmissions.put(dept, departmentEmissions.getOrDefault(dept, 0.0) + memberTotal);
        }

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalMembers", totalMembers);
        metrics.put("activeMembers", activeMembers);
        metrics.put("totalCarbonFootprint", totalCarbonFootprint);
        metrics.put("avgCarbonPerMember", activeMembers > 0 ? totalCarbonFootprint / activeMembers : 0);
        metrics.put("totalActivities", totalActivities);
        metrics.put("departmentEmissions", departmentEmissions);
        metrics.put("privacyStatus", "OK");

        return metrics;
    }

    private Map<String, Object> generateMaskedResponse(long totalMembers, long activeMembers) {
        Map<String, Object> masked = new HashMap<>();
        masked.put("totalMembers", totalMembers);
        masked.put("activeMembers", activeMembers);
        masked.put("privacyStatus", "INSUFFICIENT_DATA");
        masked.put("message", "Data is masked to protect individual privacy. Requires at least " + PRIVACY_THRESHOLD + " active members.");
        
        masked.put("totalCarbonFootprint", null);
        masked.put("avgCarbonPerMember", null);
        masked.put("totalActivities", null);
        masked.put("departmentEmissions", null);

        return masked;
    }
}
