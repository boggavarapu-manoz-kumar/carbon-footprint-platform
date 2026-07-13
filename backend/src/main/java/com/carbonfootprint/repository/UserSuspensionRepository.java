package com.carbonfootprint.repository;

import com.carbonfootprint.entity.UserSuspension;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSuspensionRepository extends JpaRepository<UserSuspension, Long>, JpaSpecificationExecutor<UserSuspension> {

    List<UserSuspension> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<UserSuspension> findFirstByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);

    List<UserSuspension> findByActiveTrueAndEndDateBefore(java.time.LocalDateTime time);
}
