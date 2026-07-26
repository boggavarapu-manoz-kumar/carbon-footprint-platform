package com.carbonfootprint.repository;

import com.carbonfootprint.entity.UserChallenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserChallengeRepository extends JpaRepository<UserChallenge, Long> {
    List<UserChallenge> findByUserId(Long userId);
    
    @Query("SELECT COUNT(uc) FROM UserChallenge uc WHERE uc.user.id = :userId")
    Long countByUserId(@Param("userId") Long userId);

    @Query("SELECT uc.user.id, COUNT(uc) FROM UserChallenge uc GROUP BY uc.user.id")
    java.util.List<Object[]> countChallengesGroupedByUser();
}
