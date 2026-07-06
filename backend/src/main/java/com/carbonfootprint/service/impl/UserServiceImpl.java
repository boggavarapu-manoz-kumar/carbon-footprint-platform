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
    public UserDto updateUser(final Long id, final UserUpdateDto updateDto) {
        log.debug("Updating user with ID: {}", id);
        User user = findUserById(id);

        boolean updated = false;
        if (updateDto.getFullName() != null && !updateDto.getFullName().trim().isEmpty()) {
            user.setFullName(updateDto.getFullName().trim());
            updated = true;
        }
        if (updateDto.getPassword() != null && !updateDto.getPassword().trim().isEmpty()) {
            user.setPassword(updateDto.getPassword().trim());
            updated = true;
        }
        if (updateDto.getProfilePictureUrl() != null) {
            user.setProfilePictureUrl(updateDto.getProfilePictureUrl().trim());
            updated = true;
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
}
