package com.zidio.nexushr.employee.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "employee_history")
public class EmployeeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Employee employee;

    public UUID getEmployeeId() {
        return employee != null ? employee.getId() : null;
    }

    @Column(name = "change_type", nullable = false, length = 50)
    private String changeType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "previous_value", columnDefinition = "jsonb")
    private String previousValue;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "new_value", columnDefinition = "jsonb")
    private String newValue;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate = LocalDate.now();

    @Column(length = 500)
    private String remarks;

    @Column(name = "changed_by")
    private UUID changedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
