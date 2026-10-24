package com.zidio.nexushr.payroll.entity;

import com.zidio.nexushr.common.entity.AuditableEntity;
import com.zidio.nexushr.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "payslips", uniqueConstraints = {
    @UniqueConstraint(name = "uq_payslips_run_employee", columnNames = {"payroll_run_id", "employee_id"})
})
public class Payslip extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payroll_run_id", nullable = false)
    private PayrollRun payrollRun;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "month", nullable = false)
    private int month;

    @Column(name = "year", nullable = false)
    private int year;

    @Column(name = "annual_ctc", nullable = false, precision = 12, scale = 2)
    private BigDecimal annualCtc;

    @Column(name = "paid_days", nullable = false)
    private int paidDays;

    @Column(name = "lop_days", nullable = false)
    private int lopDays = 0;

    // Earnings breakdown
    @Column(name = "basic", nullable = false, precision = 12, scale = 2)
    private BigDecimal basic;

    @Column(name = "hra", nullable = false, precision = 12, scale = 2)
    private BigDecimal hra;

    @Column(name = "transport_allowance", nullable = false, precision = 12, scale = 2)
    private BigDecimal transportAllowance;

    @Column(name = "special_allowance", nullable = false, precision = 12, scale = 2)
    private BigDecimal specialAllowance;

    @Column(name = "gross_earnings", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossEarnings;

    // Deductions breakdown
    @Column(name = "pf_deduction", nullable = false, precision = 12, scale = 2)
    private BigDecimal pfDeduction = BigDecimal.ZERO;

    @Column(name = "esi_deduction", nullable = false, precision = 12, scale = 2)
    private BigDecimal esiDeduction = BigDecimal.ZERO;

    @Column(name = "pt_deduction", nullable = false, precision = 12, scale = 2)
    private BigDecimal ptDeduction = BigDecimal.ZERO;

    @Column(name = "tds_tax", nullable = false, precision = 12, scale = 2)
    private BigDecimal tdsTax = BigDecimal.ZERO;

    @Column(name = "total_deductions", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalDeductions = BigDecimal.ZERO;

    @Column(name = "net_salary", nullable = false, precision = 12, scale = 2)
    private BigDecimal netSalary;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "DRAFT"; // DRAFT, PUBLISHED, PAID
}
