package com.zidio.nexushr.employee.mapper;

import com.zidio.nexushr.employee.dto.AttendanceDto;
import com.zidio.nexushr.employee.entity.Attendance;
import org.springframework.stereotype.Component;

@Component
public class AttendanceMapper {
    public static final AttendanceMapper INSTANCE = new AttendanceMapper();

    public AttendanceDto toDto(Attendance attendance) {
        if (attendance == null) return null;
        AttendanceDto dto = new AttendanceDto();
        dto.setId(attendance.getId());
        dto.setDate(attendance.getDate());
        dto.setClockIn(attendance.getClockIn());
        dto.setClockOut(attendance.getClockOut());
        dto.setStatus(attendance.getStatus());
        dto.setWorkHours(attendance.getWorkHours());
        if (attendance.getEmployee() != null) {
            dto.setEmployeeId(attendance.getEmployee().getId());
            dto.setEmployeeName(attendance.getEmployee().getFirstName() + " " + attendance.getEmployee().getLastName());
        }
        return dto;
    }
}
