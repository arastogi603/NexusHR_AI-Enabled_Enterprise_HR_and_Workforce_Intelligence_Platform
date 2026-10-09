package com.zidio.nexushr.analytics.service;

import com.zidio.nexushr.analytics.dto.DashboardDto;
import com.zidio.nexushr.employee.repository.DepartmentRepository;
import com.zidio.nexushr.employee.repository.EmployeeRepository;
import com.zidio.nexushr.employee.repository.LeaveRepository;
import com.zidio.nexushr.payroll.repository.PayrollRecordRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.Map;

@Service
public class DashboardService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveRepository leaveRepository;
    private final PayrollRecordRepository payrollRepository;

    public DashboardService(EmployeeRepository employeeRepository,
                            DepartmentRepository departmentRepository,
                            LeaveRepository leaveRepository,
                            PayrollRecordRepository payrollRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.leaveRepository = leaveRepository;
        this.payrollRepository = payrollRepository;
    }

    public DashboardDto getAdminDashboardMetrics() {
        long totalEmployees = employeeRepository.count();
        long activeEmployees = employeeRepository.findAll().stream()
                .filter(e -> "ACTIVE".equals(e.getStatus()))
                .count();
                
        long departmentsCount = departmentRepository.count();

        // Count how many are on leave today
        LocalDate today = LocalDate.now();
        long employeesOnLeaveToday = leaveRepository.findAll().stream()
                .filter(l -> "APPROVED".equals(l.getStatus()) &&
                        !l.getStartDate().isAfter(today) &&
                        !l.getEndDate().isBefore(today))
                .map(l -> l.getEmployee().getId())
                .distinct()
                .count();

        // Calculate this month's payroll expense
        YearMonth currentMonth = YearMonth.now();
        LocalDate startOfMonth = currentMonth.atDay(1);
        LocalDate endOfMonth = currentMonth.atEndOfMonth();
        
        BigDecimal monthlyPayroll = payrollRepository.findByPayPeriodStartAndPayPeriodEnd(startOfMonth, endOfMonth).stream()
                .map(p -> p.getNetSalary())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Headcount by department
        Map<String, Long> headcount = new HashMap<>();
        departmentRepository.findAll().forEach(d -> {
            long count = employeeRepository.findAll().stream()
                    .filter(e -> e.getDepartment() != null && e.getDepartment().getId().equals(d.getId()) && "ACTIVE".equals(e.getStatus()))
                    .count();
            headcount.put(d.getName(), count);
        });

        return DashboardDto.builder()
                .totalEmployees(totalEmployees)
                .activeEmployees(activeEmployees)
                .departmentsCount(departmentsCount)
                .employeesOnLeaveToday(employeesOnLeaveToday)
                .currentMonthPayrollExpense(monthlyPayroll)
                .headcountByDepartment(headcount)
                .build();
    }
}
