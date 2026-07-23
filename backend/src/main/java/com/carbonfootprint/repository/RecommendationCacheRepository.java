package com.carbonfootprint.repository;

import com.carbonfootprint.entity.RecommendationCache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface RecommendationCacheRepository extends JpaRepository<RecommendationCache, Long> {
    
    Optional<RecommendationCache> findByUserIdAndCategoryAndTimeframe(Long userId, String category, String timeframe);
    
    List<RecommendationCache> findByUserIdAndCategory(Long userId, String category);
    
    List<RecommendationCache> findByUserIdAndTimeframe(Long userId, String timeframe);

    void deleteByUserId(Long userId);
}
