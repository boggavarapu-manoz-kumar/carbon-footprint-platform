package com.carbonfootprint.repository;

import com.carbonfootprint.entity.EmissionFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmissionFactorRepository extends JpaRepository<EmissionFactor, Long> {
    Optional<EmissionFactor> findByActivityTypeCode(String code);
    Optional<EmissionFactor> findByActivityTypeCodeIgnoreCase(String code);
    boolean existsByActivityTypeCode(String code);
}
