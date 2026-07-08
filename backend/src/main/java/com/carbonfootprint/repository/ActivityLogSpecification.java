package com.carbonfootprint.repository;

import com.carbonfootprint.entity.ActivityCategory;
import com.carbonfootprint.entity.ActivityLog;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class ActivityLogSpecification {

    public static Specification<ActivityLog> belongsToUser(Long userId) {
        return (root, query, criteriaBuilder) -> {
            if (Long.class != query.getResultType()) {
                root.fetch("activityType", jakarta.persistence.criteria.JoinType.LEFT)
                    .fetch("subCategory", jakarta.persistence.criteria.JoinType.LEFT)
                    .fetch("category", jakarta.persistence.criteria.JoinType.LEFT);
            }
            return criteriaBuilder.equal(root.get("user").get("id"), userId);
        };
    }

    public static Specification<ActivityLog> hasCategoryCode(String categoryCode) {
        return (root, query, criteriaBuilder) -> {
            if (categoryCode == null || categoryCode.trim().isEmpty()) {
                return null;
            }
            return criteriaBuilder.equal(
                    root.get("activityType").get("subCategory").get("category").get("code"), 
                    categoryCode);
        };
    }

    public static Specification<ActivityLog> isBetweenDates(LocalDate startDate, LocalDate endDate) {
        return (root, query, criteriaBuilder) -> {
            if (startDate != null && endDate != null) {
                return criteriaBuilder.between(root.get("logDate"), startDate, endDate);
            } else if (startDate != null) {
                return criteriaBuilder.greaterThanOrEqualTo(root.get("logDate"), startDate);
            } else if (endDate != null) {
                return criteriaBuilder.lessThanOrEqualTo(root.get("logDate"), endDate);
            }
            return null;
        };
    }
}
