package com.carbonfootprint.entity.admin;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_emission_summary")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEmissionSummary {
    @Id
    private Long userId;
    
    private String username;
    private BigDecimal totalEmission;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
