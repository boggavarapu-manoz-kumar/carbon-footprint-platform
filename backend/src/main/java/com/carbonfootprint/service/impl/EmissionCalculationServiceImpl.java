package com.carbonfootprint.service.impl;

import com.carbonfootprint.dto.activity.CalculationResponseDto;
import com.carbonfootprint.entity.EmissionFactor;
import com.carbonfootprint.exception.BadRequestException;
import com.carbonfootprint.exception.MissingEmissionFactorException;
import com.carbonfootprint.repository.EmissionFactorRepository;
import com.carbonfootprint.service.EmissionCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmissionCalculationServiceImpl implements EmissionCalculationService {

    private final EmissionFactorRepository emissionFactorRepository;

    @Override
    public CalculationResponseDto calculateEmission(String activityType, BigDecimal quantity, String unit) {
        log.debug("Calculating emission for activity: {}, quantity: {}, unit: {}", activityType, quantity, unit);
        
        EmissionFactor factor = emissionFactorRepository.findByActivityTypeCode(activityType)
                .orElseThrow(() -> new MissingEmissionFactorException(activityType));
                
        // Enforce strict unit matching for MVP calculation safety
        if (!factor.getUnit().split("/")[1].trim().equalsIgnoreCase(unit.trim())) {
            throw new BadRequestException(
                String.format("Unit mismatch. Expected %s, but provided %s", 
                factor.getUnit().split("/")[1], unit)
            );
        }
        
        BigDecimal factorVal = factor.getFactorValue();
        BigDecimal emission = quantity.multiply(factorVal).setScale(2, RoundingMode.HALF_UP);
        log.debug("Calculated emission: {}", emission);
        
        String breakdown = String.format("%s %s × %s %s = %s kg CO₂e", 
            quantity, unit, factorVal, factor.getUnit(), emission);
        
        return CalculationResponseDto.builder()
                .emission(emission)
                .factorUsed(factorVal)
                .breakdown(breakdown)
                .build();
    }
}
