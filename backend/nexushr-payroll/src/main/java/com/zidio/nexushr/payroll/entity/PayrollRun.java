package com.zidio.nexushr.payroll.entity;

import com.zidio.nexushr.common.entity.AuditableEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "payroll_runs", uniqueConstraints = {
    @UniqueConstraint(name = "uq_payroll_runs_month_year", columnNames = {"month", "year"})
})
public class PayrollRun extends AuditableEntity {

    @Column(name = "month", nullable = false)
    private int month;

    @Column(name = "year", nullable = false)
    private int year;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "COMPLETED"; // PREVIEW, PROCESSING, COMPLETED, PUBLISHED, FAILED

    @Column(name = "total_gross", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalGross = BigDecimal.ZERO;

    @Column(name = "total_deductions", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "total_tax", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalTax = BigDecimal.ZERO;

    @Column(name = "total_net", nullable = false, precision = 14, scale = 2)
    private BigDecimal totalNet = BigDecimal.ZERO;

    @Column(name = "total_employees", nullable = false)
    private int totalEmployees = 0;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "published_by")
    private UUID publishedBy;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @OneToMany(mappedBy = "payrollRun", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Payslip> payslips = new ArrayList<>();
}
