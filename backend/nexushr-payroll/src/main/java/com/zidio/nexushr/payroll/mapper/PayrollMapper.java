package com.zidio.nexushr.payroll.mapper;

import com.zidio.nexushr.payroll.dto.PayrollDto;
import com.zidio.nexushr.payroll.entity.PayrollRecord;
import org.springframework.stereotype.Component;

@Component
public class PayrollMapper {
    public static final PayrollMapper INSTANCE = new PayrollMapper();

    public PayrollDto toDto(PayrollRecord payroll) {
        if (payroll == null) return null;
        PayrollDto dto = new PayrollDto();
        dto.setId(payroll.getId());
        dto.setPayPeriodStart(payroll.getPayPeriodStart());
        dto.setPayPeriodEnd(payroll.getPayPeriodEnd());
        dto.setBaseSalary(payroll.getBaseSalary());
        dto.setAllowances(payroll.getAllowances());
        dto.setDeductions(payroll.getDeductions());
        dto.setTax(payroll.getTax());
        dto.setNetSalary(payroll.getNetSalary());
        dto.setStatus(payroll.getStatus());
        dto.setProcessedDate(payroll.getProcessedDate());
        dto.setRemarks(payroll.getRemarks());
        if (payroll.getEmployee() != null) {
            dto.setEmployeeId(payroll.getEmployee().getId());
            dto.setEmployeeName(payroll.getEmployee().getFirstName() + " " + payroll.getEmployee().getLastName());
            dto.setEmployeeCode(payroll.getEmployee().getEmployeeCode());
        }
        return dto;
    }
}
