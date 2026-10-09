package com.zidio.nexushr.employee.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class LeaveDto {
    private UUID id;
    private UUID employeeId;
    private String employeeName;
    private String leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String status;
    private UUID approvedById;
    private String approvedByName;
}
