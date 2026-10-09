package com.zidio.nexushr.performance.entity;

import com.zidio.nexushr.common.entity.AuditableEntity;
import com.zidio.nexushr.employee.entity.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "performance_reviews")
public class PerformanceReview extends AuditableEntity {

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "reviewer_id", nullable = false)
    private Employee reviewer;

    @Column(name = "review_period", nullable = false, length = 50)
    private String reviewPeriod;

    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal score;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(nullable = false, length = 50)
    private String status = "DRAFT";
}
