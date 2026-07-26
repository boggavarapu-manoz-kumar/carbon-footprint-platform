package com.carbonfootprint.repository;

import com.carbonfootprint.entity.UserSustainabilityProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSustainabilityProfileRepository extends JpaRepository<UserSustainabilityProfile, Long> {
    Optional<UserSustainabilityProfile> findByUserId(Long userId);
}
