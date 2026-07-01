package com.carbonfootprint.mapper;

import com.carbonfootprint.dto.activity.ActivityLogCreateDto;
import com.carbonfootprint.dto.activity.ActivityLogDto;
import com.carbonfootprint.entity.ActivityCategory;
import com.carbonfootprint.entity.ActivityLog;
import com.carbonfootprint.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("ActivityLogMapper Unit Tests")
class ActivityLogMapperTest {

    private ActivityLogMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new ActivityLogMapper();
    }

    @Test
    @DisplayName("toEntity should map all ActivityLogCreateDto fields correctly")
    void toEntity_Success() {
        ActivityLogCreateDto dto = ActivityLogCreateDto.builder()
                .category(ActivityCategory.TRANSPORT)
                .activityType("CAR_PETROL")
                .quantity(new BigDecimal("100"))
                .unit("km")
                .logDate(LocalDate.of(2026, 6, 15))
                .build();

        ActivityLog entity = mapper.toEntity(dto);

        assertThat(entity).isNotNull();
        assertThat(entity.getCategory()).isEqualTo(ActivityCategory.TRANSPORT);
        assertThat(entity.getActivityType()).isEqualTo("CAR_PETROL");
        assertThat(entity.getQuantity()).isEqualByComparingTo(new BigDecimal("100"));
        assertThat(entity.getUnit()).isEqualTo("km");
        assertThat(entity.getLogDate()).isEqualTo(LocalDate.of(2026, 6, 15));
    }

    @Test
    @DisplayName("toDto should include correct userId from associated User entity")
    void toDto_Success_IncludesUserId() {
        User user = User.builder().id(99L).build();
        ActivityLog entity = ActivityLog.builder()
                .id(1L).user(user)
                .category(ActivityCategory.ELECTRICITY)
                .activityType("ELECTRICITY_GRID")
                .quantity(new BigDecimal("200"))
                .unit("kWh")
                .emissionValue(new BigDecimal("77.000"))
                .logDate(LocalDate.now())
                .build();

        ActivityLogDto dto = mapper.toDto(entity);

        assertThat(dto.getUserId()).isEqualTo(99L);
        assertThat(dto.getEmissionValue()).isEqualByComparingTo(new BigDecimal("77.000"));
    }

    @Test
    @DisplayName("toEntity with null returns null")
    void toEntity_Null_ReturnsNull() {
        assertThat(mapper.toEntity(null)).isNull();
    }

    @Test
    @DisplayName("toDto with null returns null")
    void toDto_Null_ReturnsNull() {
        assertThat(mapper.toDto(null)).isNull();
    }
}
