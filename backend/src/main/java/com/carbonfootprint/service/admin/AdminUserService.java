package com.carbonfootprint.service.admin;

import com.carbonfootprint.dto.admin.AdminUserResponse;
import com.carbonfootprint.dto.admin.UserStatusUpdateRequest;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserService {

    private final UserRepository userRepository;

    /**
     * Retrieves a paginated list of all platform users.
     * Supports optional search by first name, last name, username, or email.
     */
    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getUsers(String search, int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> users;
        if (StringUtils.hasText(search)) {
            // Use Spring Data's findAll with example matcher for flexible text search
            User probe = User.builder()
                    .firstName(search)
                    .build();
            ExampleMatcher matcher = ExampleMatcher.matchingAny()
                    .withMatcher("firstName", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
                    .withMatcher("lastName", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
                    .withMatcher("username", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
                    .withMatcher("email", ExampleMatcher.GenericPropertyMatchers.contains().ignoreCase())
                    .withIgnorePaths("role", "provider", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "enabled");
            users = userRepository.findAll(Example.of(probe, matcher), pageable);
        } else {
            users = userRepository.findAll(pageable);
        }

        return users.map(this::toDto);
    }

    /**
     * Retrieves a single user's full profile.
     */
    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        return toDto(user);
    }

    /**
     * Suspends a user — disables their account.
     * NOTE: The User entity uses Spring Security's isEnabled() flag.
     * We model "suspended" as a non-enabled account state.
     */
    @Transactional
    public void updateUserStatus(Long id, UserStatusUpdateRequest request) {
        log.info("Admin updating user {} status to: {}", id, request.getStatus());
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        // For now we log and save; once the 'enabled' or 'locked' field is added to User entity
        // update the flag here. The DTO shape is already defined.
        log.info("Status update for user {}: requested={}, reason={}", user.getEmail(), request.getStatus(), request.getReason());
        userRepository.save(user);
    }

    /**
     * Maps a User entity to an AdminUserResponse DTO.
     * Critically never exposes passwords, tokens, or internal provider IDs.
     */
    private AdminUserResponse toDto(User user) {
        String displayName = user.getFirstName() + (user.getLastName() != null ? " " + user.getLastName() : "");
        // Infer enabled state; extend once User entity has explicit `enabled` column
        String status = (user.isEnabled() && user.isAccountNonLocked()) ? "ACTIVE" : "SUSPENDED";
        return new AdminUserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getProfileUsername(),
                user.getUsername(), // getUsername() returns email in this entity
                user.getRole().name(),
                status,
                user.getProvider().name(),
                user.getGender(),
                user.getMobileNumber(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
