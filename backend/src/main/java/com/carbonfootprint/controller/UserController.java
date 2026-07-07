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
        return ResponseEntity.ok(ApiResponse.success(user));
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
