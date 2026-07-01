package com.carbonfootprint.service;

import com.carbonfootprint.entity.EmissionFactor;
import com.carbonfootprint.exception.BadRequestException;
import com.carbonfootprint.exception.MissingEmissionFactorException;
import com.carbonfootprint.repository.EmissionFactorRepository;
import com.carbonfootprint.service.impl.EmissionCalculationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EmissionCalculationService Unit Tests")
class EmissionCalculationServiceTest {

    @Mock
    private EmissionFactorRepository repository;

    @InjectMocks
    private EmissionCalculationServiceImpl service;

    private EmissionFactor carPetrolFactor;

    @BeforeEach
    void setUp() {
        carPetrolFactor = EmissionFactor.builder()
                .id(1L)
                .activityType("CAR_PETROL")
                .factorValue(new BigDecimal("0.192"))
                .unit("kgCO2e/km")
                .source("EPA 2023")
                .build();
    }

    @Nested
    @DisplayName("Positive Cases")
    class PositiveCases {

        @Test
        @DisplayName("Should calculate emission correctly for valid input")
        void calculateEmission_Success_CorrectValue() {
            when(repository.findByActivityTypeIgnoreCase("CAR_PETROL"))
                    .thenReturn(Optional.of(carPetrolFactor));

            BigDecimal result = service.calculateEmission("CAR_PETROL", new BigDecimal("100"), "km");

            assertThat(result).isEqualByComparingTo(new BigDecimal("19.200"));
            verify(repository, times(1)).findByActivityTypeIgnoreCase("CAR_PETROL");
        }

        @Test
        @DisplayName("Should be case-insensitive for activity type lookup")
        void calculateEmission_Success_CaseInsensitive() {
            when(repository.findByActivityTypeIgnoreCase("car_petrol"))
                    .thenReturn(Optional.of(carPetrolFactor));

            BigDecimal result = service.calculateEmission("car_petrol", new BigDecimal("50"), "km");

            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("Electricity factor calculates correctly")
        void calculateEmission_Electricity_Success() {
            EmissionFactor electricityFactor = EmissionFactor.builder()
                    .activityType("ELECTRICITY_GRID")
                    .factorValue(new BigDecimal("0.385"))
                    .unit("kgCO2e/kWh")
                    .build();

            when(repository.findByActivityTypeIgnoreCase("ELECTRICITY_GRID"))
                    .thenReturn(Optional.of(electricityFactor));

            BigDecimal result = service.calculateEmission("ELECTRICITY_GRID", new BigDecimal("200"), "kWh");

            assertThat(result).isEqualByComparingTo(new BigDecimal("77.000"));
        }
    }

    @Nested
    @DisplayName("Negative Cases")
    class NegativeCases {

        @Test
        @DisplayName("Should throw MissingEmissionFactorException for unknown activity type")
        void calculateEmission_Throws_WhenFactorMissing() {
            when(repository.findByActivityTypeIgnoreCase("UNKNOWN_TYPE"))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> service.calculateEmission("UNKNOWN_TYPE", new BigDecimal("100"), "km"))
                    .isInstanceOf(MissingEmissionFactorException.class)
                    .hasMessageContaining("UNKNOWN_TYPE");
        }

        @Test
        @DisplayName("Should throw BadRequestException when unit mismatches factor unit")
        void calculateEmission_Throws_OnUnitMismatch() {
            when(repository.findByActivityTypeIgnoreCase("CAR_PETROL"))
                    .thenReturn(Optional.of(carPetrolFactor));

            assertThatThrownBy(() -> service.calculateEmission("CAR_PETROL", new BigDecimal("100"), "miles"))
                    .isInstanceOf(BadRequestException.class)
                    .hasMessageContaining("Unit mismatch");
        }
    }

    @Nested
    @DisplayName("Boundary Cases")
    class BoundaryCases {

        @Test
        @DisplayName("Should calculate correctly with quantity of 1 (minimum valid)")
        void calculateEmission_Boundary_MinQuantity() {
            when(repository.findByActivityTypeIgnoreCase("CAR_PETROL"))
                    .thenReturn(Optional.of(carPetrolFactor));

            BigDecimal result = service.calculateEmission("CAR_PETROL", BigDecimal.ONE, "km");

            assertThat(result).isEqualByComparingTo(new BigDecimal("0.192"));
        }

        @Test
        @DisplayName("Should calculate correctly with very large quantity")
        void calculateEmission_Boundary_LargeQuantity() {
            when(repository.findByActivityTypeIgnoreCase("CAR_PETROL"))
                    .thenReturn(Optional.of(carPetrolFactor));

            BigDecimal result = service.calculateEmission("CAR_PETROL", new BigDecimal("9999999"), "km");

            assertThat(result).isGreaterThan(BigDecimal.ZERO);
        }

        @Test
        @DisplayName("Zero quantity should result in zero emission")
        void calculateEmission_Boundary_ZeroQuantity() {
            when(repository.findByActivityTypeIgnoreCase("CAR_PETROL"))
                    .thenReturn(Optional.of(carPetrolFactor));

            BigDecimal result = service.calculateEmission("CAR_PETROL", BigDecimal.ZERO, "km");

            assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
        }
    }
}
