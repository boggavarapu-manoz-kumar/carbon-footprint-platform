package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.UserCreateDto;
import com.carbonfootprint.dto.UserDto;
import com.carbonfootprint.dto.UserUpdateDto;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.exception.BadRequestException;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.mapper.UserMapper;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public UserDto createUser(final UserCreateDto createDto) {
        log.debug("Creating new user with email: {}", createDto.getEmail());

        if (userRepository.existsByEmail(createDto.getEmail())) {
            log.warn("Email already registered: {}", createDto.getEmail());
            throw new BadRequestException("Email already registered: " + createDto.getEmail());
        }

        User user = userMapper.toEntity(createDto);
        User savedUser = userRepository.save(user);

        log.info("User created successfully with ID: {}", savedUser.getId());
        return userMapper.toDto(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDto getUserById(final Long id) {
        log.debug("Fetching user by ID: {}", id);
        User user = findUserById(id);
        return userMapper.toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(value = "userProfile", key = "#email")
    public UserDto getUserByEmail(final String email) {
        log.debug("Fetching user by email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return userMapper.toDto(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserDto> getAllUsers(final Pageable pageable) {
        log.debug("Fetching all users with pagination: {}", pageable);
        return userRepository.findAll(pageable)
                .map(userMapper::toDto);
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "userProfile", key = "#result.email")
    public UserDto updateUser(final Long id, final UserUpdateDto updateDto) {
        log.debug("Updating user with ID: {}", id);
        User user = findUserById(id);

        boolean updated = false;
        if (updateDto.getFirstName() != null && !updateDto.getFirstName().trim().isEmpty()) {
            user.setFirstName(updateDto.getFirstName().trim());
            updated = true;
        }
        if (updateDto.getLastName() != null && !updateDto.getLastName().trim().isEmpty()) {
            user.setLastName(updateDto.getLastName().trim());
            updated = true;
        }
        if (updateDto.getUsername() != null && !updateDto.getUsername().trim().isEmpty()) {
            String newUsername = updateDto.getUsername().trim();
            if (!newUsername.equals(user.getProfileUsername())) {
                if (userRepository.existsByUsername(newUsername)) {
                    throw new BadRequestException("Username is already taken");
                }
                if (user.getLastUsernameChangeDate() != null && user.getLastUsernameChangeDate().isAfter(java.time.LocalDateTime.now().minusDays(30))) {
                    throw new BadRequestException("Username can only be changed once every 30 days");
                }
                user.setUsername(newUsername);
                user.setLastUsernameChangeDate(java.time.LocalDateTime.now());
                updated = true;
            }
        }
        if (updateDto.getMobileNumber() != null) {
            String newMobile = updateDto.getMobileNumber().trim();
            if (!newMobile.equals(user.getMobileNumber())) {
                user.setMobileNumber(newMobile.isEmpty() ? null : newMobile);
                updated = true;
            }
        }
        if (updateDto.getPassword() != null && !updateDto.getPassword().trim().isEmpty()) {
            user.setPassword(updateDto.getPassword().trim());
            updated = true;
        }
        if (updateDto.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(updateDto.getProfilePictureUrl().trim());
            updated = true;
        }
        if (updateDto.getGender() != null) {
            String newGender = updateDto.getGender().trim();
            if (!newGender.equals(user.getGender())) {
                user.setGender(newGender.isEmpty() ? null : newGender);
                updated = true;
            }
        }
        if (updateDto.getSustainabilityPreferences() != null) {
            user.setSustainabilityPreferences(updateDto.getSustainabilityPreferences().trim());
            updated = true;
        }

        if (updated) {
            user = userRepository.save(user);
            log.info("User updated successfully with ID: {}", id);
        }

        return userMapper.toDto(user);
    }

    @Override
    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "userProfile", allEntries = true)
    public void deleteUser(final Long id) {
        log.debug("Deleting user with ID: {}", id);
        User user = findUserById(id);
        userRepository.delete(user);
        log.info("User deleted successfully with ID: {}", id);
    }

    private User findUserById(final Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean checkUsernameAvailability(String username) {
        if (username == null || username.trim().isEmpty()) {
            return false;
        }
        return !userRepository.existsByUsername(username.trim());
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<String> suggestUsernames(String firstName, String lastName) {
        java.util.List<String> suggestions = new java.util.ArrayList<>();
        if (firstName == null || firstName.trim().isEmpty()) {
            return suggestions;
        }
        
        String cleanFirst = firstName.trim().toLowerCase().replaceAll("[^a-z0-9]", "");
        String cleanLast = (lastName != null) ? lastName.trim().toLowerCase().replaceAll("[^a-z0-9]", "") : "";
        
        String[] templates;
        if (!cleanLast.isEmpty()) {
            templates = new String[]{
                cleanFirst + cleanLast,
                cleanFirst + "." + cleanLast,
                cleanFirst + "_" + cleanLast,
                cleanFirst.charAt(0) + cleanLast,
                cleanFirst + cleanLast.charAt(0)
            };
        } else {
            templates = new String[]{
                cleanFirst,
                cleanFirst + "123",
                cleanFirst + "_user"
            };
        }

        for (String template : templates) {
            if (!userRepository.existsByUsername(template)) {
                suggestions.add(template);
            }
            if (suggestions.size() >= 3) break;
        }

        // If we still need more, append random numbers
        int attempts = 0;
        java.util.Random random = new java.util.Random();
        while (suggestions.size() < 3 && attempts < 10) {
            String randomSuggest = cleanFirst + random.nextInt(1000);
            if (!suggestions.contains(randomSuggest) && !userRepository.existsByUsername(randomSuggest)) {
                suggestions.add(randomSuggest);
            }
            attempts++;
        }

        return suggestions;
    }
}
