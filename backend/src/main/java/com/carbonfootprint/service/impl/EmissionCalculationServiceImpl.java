package com.carbonfootprint.service.impl;

import com.carbonfootprint.entity.EmissionFactor;
import com.carbonfootprint.exception.BadRequestException;
import com.carbonfootprint.exception.MissingEmissionFactorException;
import com.carbonfootprint.repository.EmissionFactorRepository;
import com.carbonfootprint.service.EmissionCalculationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmissionCalculationServiceImpl implements EmissionCalculationService {

    private final EmissionFactorRepository emissionFactorRepository;

    @Override
    public BigDecimal calculateEmission(String activityType, BigDecimal quantity, String unit) {
        log.debug("Calculating emission for activity: {}, quantity: {}, unit: {}", activityType, quantity, unit);
        
        EmissionFactor factor = emissionFactorRepository.findByActivityTypeIgnoreCase(activityType)
                .orElseThrow(() -> new MissingEmissionFactorException(activityType));
                
        // Enforce strict unit matching for MVP calculation safety
        if (!factor.getUnit().split("/")[1].trim().equalsIgnoreCase(unit.trim())) {
            throw new BadRequestException(
                String.format("Unit mismatch. Expected %s, but provided %s", 
                factor.getUnit().split("/")[1], unit)
            );
        }
        
        BigDecimal emission = quantity.multiply(factor.getFactorValue());
        log.debug("Calculated emission: {}", emission);
        
        return emission;
    }
}
