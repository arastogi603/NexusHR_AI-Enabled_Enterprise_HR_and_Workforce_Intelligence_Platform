package com.zidio.nexushr.employee.entity;

import com.zidio.nexushr.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "leave_balances")
public class LeaveBalance extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "casual_leave", nullable = false)
    private Integer casualLeave = 12;

    @Column(name = "sick_leave", nullable = false)
    private Integer sickLeave = 12;

    @Column(name = "earned_leave", nullable = false)
    private Integer earnedLeave = 15;

    @Column(name = "maternity_leave", nullable = false)
    private Integer maternityLeave = 0;
}
