package com.carbonfootprint.service;

import com.carbonfootprint.dto.leaderboard.LeaderboardEntryDto;
import com.carbonfootprint.dto.leaderboard.LeaderboardResponseDto;
import com.carbonfootprint.entity.OrganizationMember;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.OrganizationMemberRepository;
import com.carbonfootprint.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationLeaderboardService {

    private final OrganizationMemberRepository memberRepository;
    private final ActivityLogRepository activityLogRepository;
    private final LeaderboardService leaderboardService;

    public LeaderboardResponseDto getOrganizationLeaderboard(Long organizationId, String currentUserEmail) {
        // Fetch all active members of the organization
        List<OrganizationMember> members = memberRepository.findByOrganizationIdAndStatus(organizationId, "ACTIVE");
        
        List<Long> memberUserIds = members.stream()
                .map(m -> m.getUser().getId())
                .collect(Collectors.toList());

        // This is a naive implementation for the scope of the prototype.
        // A production ready implementation would pass the userIds to a specific 
        // JPQL aggregation query to only sum the points for those users.
        
        // For simplicity, since LeaderboardService caches/computes the global leaderboard,
        // we can fetch the global leaderboard and filter it by our organization's members.
        // Then re-rank them.
        LeaderboardResponseDto global = leaderboardService.getLeaderboard(null, null, null);
        
        List<LeaderboardEntryDto> orgEntries = global.getTopUsers().stream()
                .filter(entry -> memberUserIds.contains(entry.getUserId()))
                .collect(Collectors.toList());
                
        // Re-rank
        orgEntries.sort(Comparator.comparing(LeaderboardEntryDto::getTotalSustainabilityScore).reversed());
        
        LeaderboardEntryDto currentUserEntry = null;
        for (int i = 0; i < orgEntries.size(); i++) {
            LeaderboardEntryDto entry = orgEntries.get(i);
            entry.setRank(i + 1);
            if (currentUserEmail != null && entry.getUsername() != null && entry.getUsername().equals(currentUserEmail)) {
                currentUserEntry = entry;
            }
        }
        
        return LeaderboardResponseDto.builder()
                .topUsers(orgEntries)
                .currentUser(currentUserEntry)
                .totalUsers(orgEntries.size())
                .build();
    }
}
