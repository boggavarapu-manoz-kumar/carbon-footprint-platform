package com.carbonfootprint.entity.admin;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_history_logs", indexes = {
    @Index(name = "idx_activity_history_id", columnList = "activity_id, log_type")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityHistoryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "activity_id", nullable = false)
    private Long activityId;

    @Column(name = "log_type", nullable = false, length = 20)
    private String logType; // "REGULAR" or "OTHER"

    @Column(nullable = false, length = 20)
    private String action; // "CREATED", "UPDATED", "DELETED"

    @Column(name = "changed_by", nullable = false)
    private String changedBy; // email of user or admin

    @Column(name = "old_data", columnDefinition = "JSON")
    private String oldData;

    @Column(name = "new_data", columnDefinition = "JSON")
    private String newData;

    @CreationTimestamp
    @Column(updatable = false, nullable = false)
    private LocalDateTime timestamp;
}
