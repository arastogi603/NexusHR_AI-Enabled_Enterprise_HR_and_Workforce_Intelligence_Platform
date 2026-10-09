package com.zidio.nexushr.employee.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class EmployeeDto {
    private UUID id;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String designation;
    private String status;
    private LocalDate hireDate;
    private UUID departmentId;
    private String departmentName;
    private UUID managerId;
    private String managerName;
    private BigDecimal salary;
}
