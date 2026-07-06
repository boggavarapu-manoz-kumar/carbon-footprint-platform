package com.carbonfootprint.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity
@Table(name = "activity_input_schemas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityInputSchema implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_type_id", nullable = false)
    @JsonIgnore
    private ActivityType activityType;

    @Column(name = "field_name", nullable = false, length = 50)
    private String fieldName;

    @Column(name = "field_type", nullable = false, length = 20)
    private String fieldType; // e.g. NUMBER, SELECT

    @Column(length = 20)
    private String unit;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired;

    @Column(name = "validation_rules", columnDefinition = "TEXT")
    private String validationRules; // JSON formatted string
}
