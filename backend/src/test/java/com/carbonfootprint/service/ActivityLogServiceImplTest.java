package com.carbonfootprint.service;

import com.carbonfootprint.dto.activity.ActivityLogCreateDto;
import com.carbonfootprint.dto.activity.ActivityLogDto;
import com.carbonfootprint.dto.activity.ActivityLogUpdateDto;
import com.carbonfootprint.entity.ActivityCategory;
import com.carbonfootprint.entity.ActivityLog;
import com.carbonfootprint.entity.User;
import com.carbonfootprint.exception.MissingEmissionFactorException;
import com.carbonfootprint.exception.ResourceNotFoundException;
import com.carbonfootprint.mapper.ActivityLogMapper;
import com.carbonfootprint.repository.ActivityLogRepository;
import com.carbonfootprint.repository.UserRepository;
import com.carbonfootprint.service.impl.ActivityLogServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ActivityLogService Unit Tests")
class ActivityLogServiceImplTest {

    @Mock private ActivityLogRepository activityLogRepository;
    @Mock private UserRepository userRepository;
    @Mock private ActivityLogMapper mapper;
    @Mock private EmissionCalculationService calculationService;

    @InjectMocks private ActivityLogServiceImpl activityLogService;

    private static final String USER_EMAIL = "test@example.com";
    private User user;
    private ActivityLog activityLog;
    private ActivityLogDto logDto;
    private ActivityLogCreateDto createDto;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).email(USER_EMAIL).build();
        createDto = ActivityLogCreateDto.builder()
                .category(ActivityCategory.TRANSPORT)
                .activityType("CAR_PETROL")
                .quantity(new BigDecimal("10"))
                .unit("km")
                .logDate(LocalDate.now())
                .build();
        activityLog = ActivityLog.builder()
                .id(1L).user(user)
                .category(ActivityCategory.TRANSPORT)
                .activityType("CAR_PETROL")
                .quantity(new BigDecimal("10"))
                .unit("km")
                .emissionValue(new BigDecimal("1.92"))
                .build();
        logDto = ActivityLogDto.builder().id(1L).userId(1L).build();
    }

    @Nested
    @DisplayName("Create Activity Log")
    class CreateLog {

        @Test
        @DisplayName("Should create log, invoke engine and save emissionValue")
        void createActivityLog_Success() {
            when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(mapper.toEntity(createDto)).thenReturn(activityLog);
            when(calculationService.calculateEmission("CAR_PETROL", new BigDecimal("10"), "km"))
                    .thenReturn(new BigDecimal("1.92"));
            when(activityLogRepository.save(activityLog)).thenReturn(activityLog);
            when(mapper.toDto(activityLog)).thenReturn(logDto);

            ActivityLogDto result = activityLogService.createActivityLog(USER_EMAIL, createDto);

            assertThat(result).isNotNull();
            assertThat(activityLog.getEmissionValue()).isEqualByComparingTo("1.92");
            verify(activityLogRepository).save(activityLog);
        }

        @Test
        @DisplayName("Should throw if emission factor missing for activity type")
        void createActivityLog_MissingFactor_Throws() {
            when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(mapper.toEntity(createDto)).thenReturn(activityLog);
            when(calculationService.calculateEmission(any(), any(), any()))
                    .thenThrow(new MissingEmissionFactorException("CAR_PETROL"));

            assertThatThrownBy(() -> activityLogService.createActivityLog(USER_EMAIL, createDto))
                    .isInstanceOf(MissingEmissionFactorException.class);

            verify(activityLogRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when user not found")
        void createActivityLog_UserNotFound_Throws() {
            when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> activityLogService.createActivityLog(USER_EMAIL, createDto))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("Bulk create: should create all logs in one transaction")
        void createActivityLogsBulk_Success() {
            ActivityLog log2 = ActivityLog.builder().id(2L).user(user).build();
            when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(mapper.toEntity(any(ActivityLogCreateDto.class))).thenReturn(activityLog);
            when(calculationService.calculateEmission(any(), any(), any())).thenReturn(new BigDecimal("1.92"));
            when(activityLogRepository.saveAll(any())).thenReturn(List.of(activityLog, log2));
            when(mapper.toDto(any())).thenReturn(logDto);

            List<ActivityLogDto> result = activityLogService.createActivityLogsBulk(USER_EMAIL, List.of(createDto, createDto));

            assertThat(result).hasSize(2);
            verify(activityLogRepository).saveAll(any());
        }
    }

    @Nested
    @DisplayName("Get Activity Log")
    class GetLog {

        @Test
        @DisplayName("Should fetch log by id belonging to authenticated user")
        void getById_Success() {
            when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(activityLogRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(activityLog));
            when(mapper.toDto(activityLog)).thenReturn(logDto);

            ActivityLogDto result = activityLogService.getActivityLogById(1L, USER_EMAIL);

            assertThat(result.getId()).isEqualTo(1L);
        }

        @Test
        @DisplayName("Should throw if log belongs to different user")
        void getById_WrongUser_Throws() {
            when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(activityLogRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> activityLogService.getActivityLogById(1L, USER_EMAIL))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Update Activity Log")
    class UpdateLog {

        @Test
        @DisplayName("Should recalculate emission when quantity changes")
        void updateLog_RecalculatesOnQuantityChange() {
            ActivityLogUpdateDto updateDto = ActivityLogUpdateDto.builder()
                    .quantity(new BigDecimal("20")).build();

            when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(activityLogRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(activityLog));
            when(calculationService.calculateEmission("CAR_PETROL", new BigDecimal("20"), "km"))
                    .thenReturn(new BigDecimal("3.84"));
            when(activityLogRepository.save(activityLog)).thenReturn(activityLog);
            when(mapper.toDto(activityLog)).thenReturn(logDto);

            activityLogService.updateActivityLog(1L, USER_EMAIL, updateDto);

            assertThat(activityLog.getEmissionValue()).isEqualByComparingTo("3.84");
        }
    }

    @Nested
    @DisplayName("Delete Activity Log")
    class DeleteLog {

        @Test
        @DisplayName("Should delete log owned by user")
        void deleteLog_Success() {
            when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(activityLogRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(activityLog));

            activityLogService.deleteActivityLog(1L, USER_EMAIL);

            verify(activityLogRepository).delete(activityLog);
        }

        @Test
        @DisplayName("Should throw when trying to delete log not owned by user")
        void deleteLog_NotOwned_Throws() {
            when(userRepository.findByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
            when(activityLogRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> activityLogService.deleteActivityLog(1L, USER_EMAIL))
                    .isInstanceOf(ResourceNotFoundException.class);

            verify(activityLogRepository, never()).delete(any(ActivityLog.class));
        }
    }
}
