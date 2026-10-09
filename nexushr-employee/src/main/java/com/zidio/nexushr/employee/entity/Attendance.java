package com.zidio.nexushr.employee.entity;

import com.zidio.nexushr.common.entity.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "attendance")
public class Attendance extends AuditableEntity {

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "clock_in")
    private LocalDateTime clockIn;

    @Column(name = "clock_out")
    private LocalDateTime clockOut;

    @Column(length = 20, nullable = false)
    private String status = "PRESENT"; // e.g., PRESENT, ABSENT, HALF_DAY, LATE

    @Column(name = "work_hours")
    private Double workHours;
}
