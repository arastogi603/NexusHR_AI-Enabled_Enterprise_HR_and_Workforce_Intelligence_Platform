package com.zidio.nexushr.payroll.service;

import com.zidio.nexushr.common.exception.ResourceNotFoundException;
import com.zidio.nexushr.employee.entity.Employee;
import com.zidio.nexushr.employee.repository.EmployeeRepository;
import com.zidio.nexushr.payroll.dto.PayrollDto;
import com.zidio.nexushr.payroll.dto.PayrollRequest;
import com.zidio.nexushr.payroll.entity.PayrollRecord;
import com.zidio.nexushr.payroll.mapper.PayrollMapper;
import com.zidio.nexushr.payroll.repository.PayrollRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PayrollService {

    private final PayrollRecordRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final PayrollMapper payrollMapper;

    public PayrollService(PayrollRecordRepository payrollRepository,
                          EmployeeRepository employeeRepository,
                          PayrollMapper payrollMapper) {
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
        this.payrollMapper = payrollMapper;
    }

    @Transactional
    public PayrollDto generatePayroll(PayrollRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (employee.getSalary() == null) {
            throw new RuntimeException("Base salary not configured for employee");
        }

        PayrollRecord record = new PayrollRecord();
        record.setEmployee(employee);
        record.setPayPeriodStart(request.getPayPeriodStart());
        record.setPayPeriodEnd(request.getPayPeriodEnd());
        
        BigDecimal baseSalary = employee.getSalary();
        record.setBaseSalary(baseSalary);
        
        // Complex logic (LWP deductions, taxes) would go here.
        // For now, simple standard deductions.
        BigDecimal taxRate = new BigDecimal("0.15"); // 15% flat tax
        BigDecimal tax = baseSalary.multiply(taxRate);
        record.setTax(tax);
        
        BigDecimal allowances = new BigDecimal("500.00"); // Fixed allowance example
        record.setAllowances(allowances);
        
        BigDecimal netSalary = baseSalary.add(allowances).subtract(tax).subtract(record.getDeductions());
        record.setNetSalary(netSalary);
        
        record.setStatus("PROCESSED");
        record.setProcessedDate(LocalDateTime.now());
        
        record = payrollRepository.save(record);
        return payrollMapper.toDto(record);
    }

    @Transactional
    public List<PayrollDto> generateBatchPayroll(List<PayrollRequest> requests) {
        return requests.stream()
                .map(this::generatePayroll)
                .collect(Collectors.toList());
    }

    public List<PayrollDto> getEmployeePayslips(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        return payrollRepository.findByEmployeeId(employee.getId()).stream()
                .map(payrollMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsPaid(UUID payrollId) {
        PayrollRecord record = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found"));
                
        record.setStatus("PAID");
        payrollRepository.save(record);
    }
}
