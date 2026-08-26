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
        
        String cleanType = activityType != null ? activityType.trim() : "";
        BigDecimal safeQuantity = quantity != null ? quantity : BigDecimal.ONE;
        String safeUnit = unit != null && !unit.trim().isEmpty() ? unit.trim() : "units";

        EmissionFactor factor = emissionFactorRepository.findByActivityTypeCode(cleanType)
                .or(() -> emissionFactorRepository.findByActivityTypeCodeIgnoreCase(cleanType))
                .or(() -> emissionFactorRepository.findByActivityTypeCode(cleanType.toUpperCase()))
                .or(() -> emissionFactorRepository.findByActivityTypeCode(cleanType.toLowerCase()))
                .orElse(null);

        BigDecimal factorVal = factor != null ? factor.getFactorValue() : BigDecimal.valueOf(0.5);
        String factorUnit = factor != null ? factor.getUnit() : safeUnit;

        BigDecimal emission = safeQuantity.multiply(factorVal).setScale(2, RoundingMode.HALF_UP);
        log.debug("Calculated emission: {}", emission);
        
        String breakdown = String.format("%s %s × %s %s = %s kg CO₂e", 
            safeQuantity, safeUnit, factorVal, factorUnit, emission);
        
        return CalculationResponseDto.builder()
                .emission(emission)
                .factorUsed(factorVal)
                .breakdown(breakdown)
                .build();
    }
}
