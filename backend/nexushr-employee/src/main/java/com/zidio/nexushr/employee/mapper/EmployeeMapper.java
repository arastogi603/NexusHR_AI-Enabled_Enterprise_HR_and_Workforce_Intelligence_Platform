package com.zidio.nexushr.employee.mapper;

import com.zidio.nexushr.employee.dto.EmployeeDto;
import com.zidio.nexushr.employee.entity.Employee;
import org.springframework.stereotype.Component;

@Component
public class EmployeeMapper {
    public static final EmployeeMapper INSTANCE = new EmployeeMapper();

    public EmployeeDto toDto(Employee employee) {
        if (employee == null) return null;
        EmployeeDto dto = new EmployeeDto();
        dto.setId(employee.getId());
        dto.setEmployeeCode(employee.getEmployeeCode());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setDesignation(employee.getDesignation());
        dto.setStatus(employee.getStatus());
        dto.setHireDate(employee.getHireDate());
        dto.setSalary(employee.getSalary());
        if (employee.getDepartment() != null) {
            dto.setDepartmentId(employee.getDepartment().getId());
            dto.setDepartmentName(employee.getDepartment().getName());
        }
        if (employee.getManager() != null) {
            dto.setManagerId(employee.getManager().getId());
            dto.setManagerName(employee.getManager().getFirstName() + " " + employee.getManager().getLastName());
        }
        return dto;
    }
}
