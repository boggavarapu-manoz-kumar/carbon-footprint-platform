package com.carbonfootprint.controller;

import com.carbonfootprint.dto.UserCreateDto;
import com.carbonfootprint.dto.UserDto;
import com.carbonfootprint.dto.UserUpdateDto;
import com.carbonfootprint.response.ApiResponse;
import com.carbonfootprint.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final com.carbonfootprint.repository.UserRepository userRepository;
    private final com.carbonfootprint.repository.OrganizationMembershipRepository organizationMembershipRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<UserDto>> createUser(@Valid @RequestBody UserCreateDto createDto) {
        log.info("REST request to create User");
        UserDto createdUser = userService.createUser(createDto);
        return new ResponseEntity<>(ApiResponse.success(createdUser, "User created successfully"), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        log.info("REST request to get User by ID: {}", id);
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<ApiResponse<UserDto>> getUserByEmail(@PathVariable String email) {
        log.info("REST request to get User by email");
        UserDto user = userService.getUserByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserDto>>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        log.info("REST request to get all Users");
        Page<UserDto> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateDto updateDto) {
        log.info("REST request to update User by ID: {}", id);
        UserDto updatedUser = userService.updateUser(id, updateDto);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "User updated successfully"));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUserProfile() {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("REST request to get User Profile for: {}", email);
        UserDto user = userService.getUserByEmail(email);
        return ResponseEntity.ok()
                .header("Cache-Control", "no-cache, no-store, max-age=0, must-revalidate")
                .header("Pragma", "no-cache")
                .header("Expires", "0")
                .body(ApiResponse.success(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateCurrentUserProfile(@Valid @RequestBody UserUpdateDto updateDto) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("REST request to update User Profile for: {}", email);
        UserDto user = userService.getUserByEmail(email);
        UserDto updatedUser = userService.updateUser(user.getId(), updateDto);
        return ResponseEntity.ok(ApiResponse.success(updatedUser, "Profile updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        log.info("REST request to delete User by ID: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deleted successfully"));
    }

    @GetMapping("/me/organization")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<com.carbonfootprint.dto.organization.OrganizationMembershipDto>> getMyOrganizationContext(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        
        com.carbonfootprint.entity.User user = userRepository.findByUsernameOrEmail(userDetails.getUsername(), userDetails.getUsername())
            .orElseGet(() -> userRepository.findByEmail(userDetails.getUsername())
            .orElseGet(() -> userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new com.carbonfootprint.exception.ResourceNotFoundException("User not found"))));
            
        // Find the active membership for this user (assuming user can only have one active membership for now)
        return organizationMembershipRepository.findByUserId(user.getId()).stream()
            .filter(m -> m.getStatus() == com.carbonfootprint.entity.organization.MembershipStatus.ACTIVE)
            .findFirst()
            .map(m -> {
                com.carbonfootprint.dto.organization.OrganizationMembershipDto dto = com.carbonfootprint.dto.organization.OrganizationMembershipDto.builder()
                        .id(m.getId())
                        .organizationId(m.getOrganization().getId())
                        .organizationName(m.getOrganization().getName())
                        .organizationLogo(m.getOrganization().getLogo())
                        .role(m.getRole())
                        .status(m.getStatus())
                        .department(m.getDepartment())
                        .jobTitle(m.getJobTitle())
                        .employeeId(m.getEmployeeId())
                        .build();
                return ResponseEntity.ok(ApiResponse.success(dto));
            })
            .orElseGet(() -> ResponseEntity.ok(ApiResponse.success(null))); // Return success with null data if not an org member
    }

    @GetMapping("/check-username")
    public ResponseEntity<ApiResponse<Boolean>> checkUsernameAvailability(@RequestParam String username) {
        log.info("REST request to check username availability for: {}", username);
        boolean available = userService.checkUsernameAvailability(username);
        return ResponseEntity.ok(ApiResponse.success(available));
    }

    @GetMapping("/suggest-username")
    public ResponseEntity<ApiResponse<java.util.List<String>>> suggestUsernames(
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName) {
        log.info("REST request to suggest usernames for {} {}", firstName, lastName);
        java.util.List<String> suggestions = userService.suggestUsernames(firstName, lastName);
        return ResponseEntity.ok(ApiResponse.success(suggestions));
    }
}
