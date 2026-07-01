package com.carbonfootprint.service;

import com.carbonfootprint.dto.UserCreateDto;
import com.carbonfootprint.dto.UserDto;
import com.carbonfootprint.dto.UserUpdateDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserDto createUser(UserCreateDto createDto);
    UserDto getUserById(Long id);
    UserDto getUserByEmail(String email);
    Page<UserDto> getAllUsers(Pageable pageable);
    UserDto updateUser(Long id, UserUpdateDto updateDto);
    void deleteUser(Long id);
}
