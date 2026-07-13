package com.carbonfootprint.service.admin;

import com.carbonfootprint.dto.admin.SuspendUserRequest;
import com.carbonfootprint.dto.admin.UserSuspensionResponse;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.entity.UserSuspension;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.repository.UserSuspensionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import com.carbonfootprint.dto.admin.BulkSuspendRequest;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.ByteArrayInputStream;

@Service
@RequiredArgsConstructor
public class UserSuspensionService {

    private final UserRepository userRepository;
    private final UserSuspensionRepository suspensionRepository;

    @Transactional
    public void suspendUser(Long userId, SuspendUserRequest request, String adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Revoke any existing active suspensions
        suspensionRepository.findFirstByUserIdAndActiveTrueOrderByCreatedAtDesc(userId)
                .ifPresent(existing -> {
                    existing.setActive(false);
                    existing.setRevokedDate(LocalDateTime.now());
                    existing.setRevokedBy(adminId);
                    suspensionRepository.save(existing);
                });

        LocalDateTime endDate = null;
        if (request.getDurationDays() != null) {
            endDate = LocalDateTime.now().plusDays(request.getDurationDays());
        } else if (request.getCustomEndDate() != null) {
            endDate = request.getCustomEndDate();
        }

        UserSuspension suspension = UserSuspension.builder()
                .user(user)
                .reason(request.getReason())
                .description(request.getDescription())
                .evidenceNotes(request.getEvidenceNotes())
                .startDate(LocalDateTime.now())
                .endDate(endDate)
                .suspendedBy(adminId)
                .active(true)
                .build();

        suspensionRepository.save(suspension);

        user.setSuspended(true);
        userRepository.save(user);
    }

    @Transactional
    public void unsuspendUser(Long userId, String adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        suspensionRepository.findFirstByUserIdAndActiveTrueOrderByCreatedAtDesc(userId)
                .ifPresent(existing -> {
                    existing.setActive(false);
                    existing.setRevokedDate(LocalDateTime.now());
                    existing.setRevokedBy(adminId);
                    suspensionRepository.save(existing);
                });

        user.setSuspended(false);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<UserSuspensionResponse> getSuspensionHistory(Long userId) {
        return suspensionRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<UserSuspensionResponse> getGlobalSuspensions(String status, String dateRange, Pageable pageable) {
        Specification<UserSuspension> spec = Specification.where(null);
        LocalDateTime now = LocalDateTime.now();

        if (status != null && !status.isEmpty() && !status.equals("All")) {
            if (status.equalsIgnoreCase("Active")) {
                spec = spec.and((root, query, cb) -> cb.isTrue(root.get("active")));
            } else if (status.equalsIgnoreCase("Expired")) {
                spec = spec.and((root, query, cb) -> cb.and(cb.isFalse(root.get("active")), cb.isNotNull(root.get("endDate")), cb.lessThan(root.get("endDate"), now)));
            } else if (status.equalsIgnoreCase("Permanent")) {
                spec = spec.and((root, query, cb) -> cb.and(cb.isTrue(root.get("active")), cb.isNull(root.get("endDate"))));
            } else if (status.equalsIgnoreCase("Revoked")) {
                spec = spec.and((root, query, cb) -> cb.and(cb.isFalse(root.get("active")), cb.isNotNull(root.get("revokedDate"))));
            }
        }

        if (dateRange != null && !dateRange.isEmpty() && !dateRange.equals("All Time")) {
            LocalDateTime startDate = null;
            if (dateRange.equalsIgnoreCase("Today")) {
                startDate = now.toLocalDate().atStartOfDay();
            } else if (dateRange.equalsIgnoreCase("This Week")) {
                startDate = now.minusDays(7);
            } else if (dateRange.equalsIgnoreCase("This Month")) {
                startDate = now.minusDays(30);
            }
            
            if (startDate != null) {
                final LocalDateTime finalStartDate = startDate;
                spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("startDate"), finalStartDate));
            }
        }

        return suspensionRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional
    public void bulkSuspend(BulkSuspendRequest request, String adminId) {
        for (Long userId : request.getUserIds()) {
            try {
                SuspendUserRequest singleRequest = new SuspendUserRequest();
                singleRequest.setDurationDays(request.getDurationDays());
                singleRequest.setCustomEndDate(request.getCustomEndDate());
                singleRequest.setReason(request.getReason());
                singleRequest.setDescription(request.getDescription());
                singleRequest.setEvidenceNotes(request.getEvidenceNotes());
                suspendUser(userId, singleRequest, adminId);
            } catch (Exception e) {
                // log and continue
            }
        }
    }

    @Transactional(readOnly = true)
    public ByteArrayInputStream exportSuspensions() {
        List<UserSuspension> suspensions = suspensionRepository.findAll();
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        pw.println("ID,User ID,Reason,Active,Start Date,End Date,Revoked Date");
        for (UserSuspension s : suspensions) {
            pw.printf("%d,%d,\"%s\",%b,%s,%s,%s%n",
                    s.getId(), s.getUser().getId(), s.getReason(), s.isActive(),
                    s.getStartDate(), s.getEndDate() != null ? s.getEndDate() : "Permanent",
                    s.getRevokedDate() != null ? s.getRevokedDate() : "");
        }
        return new ByteArrayInputStream(sw.toString().getBytes());
    }

    private UserSuspensionResponse mapToResponse(UserSuspension s) {
        User user = s.getUser();
        return UserSuspensionResponse.builder()
                .id(s.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .reason(s.getReason())
                .description(s.getDescription())
                .evidenceNotes(s.getEvidenceNotes())
                .startDate(s.getStartDate())
                .endDate(s.getEndDate())
                .suspendedBy(s.getSuspendedBy())
                .active(s.isActive())
                .revokedDate(s.getRevokedDate())
                .revokedBy(s.getRevokedBy())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
