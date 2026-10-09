package com.zidio.nexushr.analytics.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class DashboardDto {
    private long totalEmployees;
    private long activeEmployees;
    private long departmentsCount;
    private long employeesOnLeaveToday;
    private BigDecimal currentMonthPayrollExpense;
    private Map<String, Long> headcountByDepartment;
}
