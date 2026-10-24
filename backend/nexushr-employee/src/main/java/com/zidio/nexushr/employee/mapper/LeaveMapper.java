package com.zidio.nexushr.employee.mapper;

import com.zidio.nexushr.employee.dto.LeaveDto;
import com.zidio.nexushr.employee.entity.Leave;
import org.springframework.stereotype.Component;

@Component
public class LeaveMapper {
    public static final LeaveMapper INSTANCE = new LeaveMapper();

    public LeaveDto toDto(Leave leave) {
        if (leave == null) return null;
        LeaveDto dto = new LeaveDto();
        dto.setId(leave.getId());
        dto.setLeaveType(leave.getLeaveType());
        dto.setStartDate(leave.getStartDate());
        dto.setEndDate(leave.getEndDate());
        dto.setReason(leave.getReason());
        dto.setStatus(leave.getStatus());
        if (leave.getEmployee() != null) {
            dto.setEmployeeId(leave.getEmployee().getId());
            dto.setEmployeeName(leave.getEmployee().getFirstName() + " " + leave.getEmployee().getLastName());
        }
        if (leave.getApprovedBy() != null) {
            dto.setApprovedById(leave.getApprovedBy().getId());
            dto.setApprovedByName(leave.getApprovedBy().getFirstName() + " " + leave.getApprovedBy().getLastName());
        }
        return dto;
    }
}
