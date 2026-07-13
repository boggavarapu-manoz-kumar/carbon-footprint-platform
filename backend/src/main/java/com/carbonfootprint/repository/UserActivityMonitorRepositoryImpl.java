package com.carbonfootprint.repository;

import com.carbonfootprint.dto.activity.UserActivityHistoryDTO;
import com.carbonfootprint.dto.activity.UserActivityHistoryFilterDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Time;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class UserActivityMonitorRepositoryImpl implements UserActivityMonitorRepositoryCustom {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    @Override
    public Page<UserActivityHistoryDTO> findFilteredUserActivities(String userEmail, UserActivityHistoryFilterDTO filter, Pageable pageable) {
        StringBuilder cte = new StringBuilder();
        cte.append("WITH UnifiedLogs AS ( ");
        cte.append("  SELECT 'REGULAR' as logType, a.id as id, t.name as activityName, c.name as category, ");
        cte.append("         u.email as userEmail, ");
        cte.append("         a.quantity as quantity, a.unit as unit, a.emission_value as carbonEmission, ");
        cte.append("         a.log_date as logDate, NULL as logTime, a.created_at as createdAt ");
        cte.append("  FROM activity_logs a ");
        cte.append("  JOIN users u ON a.user_id = u.id ");
        cte.append("  JOIN activity_types t ON a.activity_type_id = t.id ");
        cte.append("  JOIN activity_subcategories sc ON t.subcategory_id = sc.id ");
        cte.append("  JOIN activity_categories c ON sc.category_id = c.id ");
        cte.append("  WHERE u.email = :userEmail ");
        cte.append("  UNION ALL ");
        cte.append("  SELECT 'OTHER' as logType, o.id as id, o.activity_name as activityName, 'Other Activities' as category, ");
        cte.append("         u.email as userEmail, ");
        cte.append("         o.quantity as quantity, o.unit as unit, o.carbon_value as carbonEmission, ");
        cte.append("         o.log_date as logDate, o.log_time as logTime, o.created_at as createdAt ");
        cte.append("  FROM other_activity_logs o ");
        cte.append("  JOIN users u ON o.user_id = u.id ");
        cte.append("  WHERE u.email = :userEmail ");
        cte.append(") ");

        StringBuilder whereClause = new StringBuilder(" WHERE 1=1 ");
        MapSqlParameterSource params = new MapSqlParameterSource();
        params.addValue("userEmail", userEmail);

        if (filter.getStartDate() != null) {
            whereClause.append(" AND createdAt >= :startDate ");
            params.addValue("startDate", Timestamp.valueOf(filter.getStartDate().atStartOfDay()));
        }
        if (filter.getEndDate() != null) {
            whereClause.append(" AND createdAt <= :endDate ");
            params.addValue("endDate", Timestamp.valueOf(filter.getEndDate().plusDays(1).atStartOfDay()));
        }
        if (filter.getCategories() != null && !filter.getCategories().isEmpty()) {
            whereClause.append(" AND category IN (:categories) ");
            params.addValue("categories", filter.getCategories());
        }
        if (filter.getSearchActivityName() != null && !filter.getSearchActivityName().trim().isEmpty()) {
            whereClause.append(" AND activityName LIKE :search ");
            params.addValue("search", "%" + filter.getSearchActivityName().trim() + "%");
        }
        if (filter.getMinEmission() != null) {
            whereClause.append(" AND carbonEmission >= :minEmission ");
            params.addValue("minEmission", filter.getMinEmission());
        }
        if (filter.getMaxEmission() != null) {
            whereClause.append(" AND carbonEmission <= :maxEmission ");
            params.addValue("maxEmission", filter.getMaxEmission());
        }

        String countQuery = cte.toString() + " SELECT COUNT(*) FROM UnifiedLogs " + whereClause.toString();
        Long totalElements = jdbcTemplate.queryForObject(countQuery, params, Long.class);
        if (totalElements == null) totalElements = 0L;

        StringBuilder dataQuery = new StringBuilder();
        dataQuery.append(cte.toString());
        dataQuery.append(" SELECT * FROM UnifiedLogs ");
        dataQuery.append(whereClause);

        // Sorting
        String sortField = filter.getSortBy() != null ? filter.getSortBy() : "createdAt";
        String sortDir = "ASC".equalsIgnoreCase(filter.getSortDirection()) ? "ASC" : "DESC";
        
        // Sanitize sortField
        if (!List.of("createdAt", "carbonEmission", "activityName", "logDate").contains(sortField)) {
            sortField = "createdAt";
        }
        dataQuery.append(" ORDER BY ").append(sortField).append(" ").append(sortDir);

        // Pagination
        dataQuery.append(" LIMIT :limit OFFSET :offset ");
        params.addValue("limit", pageable.getPageSize());
        params.addValue("offset", pageable.getOffset());

        List<UserActivityHistoryDTO> results = jdbcTemplate.query(dataQuery.toString(), params, new RowMapper<UserActivityHistoryDTO>() {
            @Override
            public UserActivityHistoryDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
                Timestamp ts = rs.getTimestamp("createdAt");
                java.sql.Date dDate = rs.getDate("logDate");
                Time tTime = rs.getTime("logTime");

                return UserActivityHistoryDTO.builder()
                        .logType(rs.getString("logType"))
                        .id(rs.getLong("id"))
                        .activityName(rs.getString("activityName"))
                        .category(rs.getString("category"))
                        .quantity(rs.getBigDecimal("quantity"))
                        .unit(rs.getString("unit"))
                        .carbonEmission(rs.getBigDecimal("carbonEmission"))
                        .logDate(dDate != null ? dDate.toLocalDate() : null)
                        .logTime(tTime != null ? tTime.toLocalTime() : null)
                        .createdAt(ts != null ? ts.toLocalDateTime() : null)
                        .build();
            }
        });

        return new PageImpl<>(results, pageable, totalElements);
    }
}
