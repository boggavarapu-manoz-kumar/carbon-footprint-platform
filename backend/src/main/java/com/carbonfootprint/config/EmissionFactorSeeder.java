package com.carbonfootprint.config;

import com.carbonfootprint.entity.EmissionFactor;
import com.carbonfootprint.repository.EmissionFactorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class EmissionFactorSeeder implements CommandLineRunner {

    private final EmissionFactorRepository repository;

    @Override
    public void run(String... args) {
        log.info("Checking if Emission Factors need seeding...");
        
        if (repository.count() == 0) {
            log.info("Seeding Enterprise Standard Emission Factors into database...");
            
            List<EmissionFactor> defaultFactors = List.of(
                EmissionFactor.builder()
                    .activityType("CAR_PETROL")
                    .factorValue(new BigDecimal("0.192"))
                    .unit("kgCO2e/km")
                    .source("EPA 2023 Guidelines")
                    .build(),
                EmissionFactor.builder()
                    .activityType("CAR_DIESEL")
                    .factorValue(new BigDecimal("0.171"))
                    .unit("kgCO2e/km")
                    .source("EPA 2023 Guidelines")
                    .build(),
                EmissionFactor.builder()
                    .activityType("ELECTRICITY_GRID")
                    .factorValue(new BigDecimal("0.385"))
                    .unit("kgCO2e/kWh")
                    .source("IEA Global Average 2023")
                    .build(),
                EmissionFactor.builder()
                    .activityType("FLIGHT_SHORT_HAUL")
                    .factorValue(new BigDecimal("0.156"))
                    .unit("kgCO2e/km")
                    .source("DEFRA 2023")
                    .build(),
                EmissionFactor.builder()
                    .activityType("BEEF_CONSUMPTION")
                    .factorValue(new BigDecimal("27.0"))
                    .unit("kgCO2e/kg")
                    .source("FAO 2023")
                    .build(),
                EmissionFactor.builder()
                    .activityType("PUBLIC_BUS")
                    .factorValue(new BigDecimal("0.105"))
                    .unit("kgCO2e/km")
                    .source("DEFRA 2023")
                    .build()
            );

            repository.saveAll(defaultFactors);
            log.info("Successfully seeded {} emission factors.", defaultFactors.size());
        } else {
            log.info("Emission factors already populated.");
        }
    }
}
