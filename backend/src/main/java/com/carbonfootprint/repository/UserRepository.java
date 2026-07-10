package com.carbonfootprint.repository;

import com.carbonfootprint.entity.Role;
import com.carbonfootprint.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameOrEmail(String username, String email);
    
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    Long countByRole(Role role);
    
    Long countByCreatedAtAfter(LocalDateTime date);
    
    // Grouping by date for user growth chart (MySQL compatible cast, or JPA function)
    @Query("SELECT function('DATE', u.createdAt) as logDate, COUNT(u) as count FROM User u WHERE u.createdAt >= :startDate GROUP BY function('DATE', u.createdAt) ORDER BY function('DATE', u.createdAt) ASC")
    List<Object[]> countUsersGroupedByDate(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT u.gender, COUNT(u) FROM User u WHERE u.gender IS NOT NULL GROUP BY u.gender")
    List<Object[]> countUsersByGender();

    @Query("SELECT function('MONTH', u.createdAt), COUNT(u) FROM User u WHERE function('YEAR', u.createdAt) = :year GROUP BY function('MONTH', u.createdAt) ORDER BY function('MONTH', u.createdAt) ASC")
    List<Object[]> countUsersGroupedByMonth(@Param("year") Integer year);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :startDate AND u.createdAt <= :endDate")
    Long countUsersInRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
