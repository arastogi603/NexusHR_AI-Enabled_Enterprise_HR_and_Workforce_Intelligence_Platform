package com.zidio.nexushr.employee.service;

import com.zidio.nexushr.common.exception.ResourceNotFoundException;
import com.zidio.nexushr.employee.dto.AttendanceDto;
import com.zidio.nexushr.employee.entity.Attendance;
import com.zidio.nexushr.employee.entity.Employee;
import com.zidio.nexushr.employee.mapper.AttendanceMapper;
import com.zidio.nexushr.employee.repository.AttendanceRepository;
import com.zidio.nexushr.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceMapper attendanceMapper;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             EmployeeRepository employeeRepository,
                             AttendanceMapper attendanceMapper) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceMapper = attendanceMapper;
    }

    @Transactional
    public AttendanceDto clockIn(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        LocalDate today = LocalDate.now();
        
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .orElse(new Attendance());

        if (attendance.getId() != null && attendance.getClockIn() != null) {
            throw new RuntimeException("Already clocked in for today");
        }

        attendance.setEmployee(employee);
        attendance.setDate(today);
        attendance.setClockIn(LocalDateTime.now());
        
        // Simple logic for late check (e.g. after 9:30 AM)
        if (LocalDateTime.now().getHour() >= 9 && LocalDateTime.now().getMinute() > 30) {
            attendance.setStatus("LATE");
        } else {
            attendance.setStatus("PRESENT");
        }

        attendance = attendanceRepository.save(attendance);
        return attendanceMapper.toDto(attendance);
    }

    @Transactional
    public AttendanceDto clockOut(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        LocalDate today = LocalDate.now();
        
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .orElseThrow(() -> new RuntimeException("No clock-in record found for today"));

        if (attendance.getClockOut() != null) {
            throw new RuntimeException("Already clocked out for today");
        }

        attendance.setClockOut(LocalDateTime.now());
        
        // Calculate work hours
        Duration duration = Duration.between(attendance.getClockIn(), attendance.getClockOut());
        double hours = duration.toMinutes() / 60.0;
        attendance.setWorkHours(Math.round(hours * 100.0) / 100.0);

        if (hours < 4.0) {
            attendance.setStatus("HALF_DAY");
        }

        attendance = attendanceRepository.save(attendance);
        return attendanceMapper.toDto(attendance);
    }

    public AttendanceDto getTodayAttendance(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), LocalDate.now())
                .orElseThrow(() -> new ResourceNotFoundException("No attendance record for today"));
                
        return attendanceMapper.toDto(attendance);
    }

    public List<AttendanceDto> getAttendanceHistory(String email, LocalDate from, LocalDate to) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        return attendanceRepository.findByEmployeeIdAndDateBetween(employee.getId(), from, to).stream()
                .map(attendanceMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getDepartmentAttendance(UUID departmentId, LocalDate date) {
        return attendanceRepository.findByEmployeeDepartmentIdAndDate(departmentId, date).stream()
                .map(attendanceMapper::toDto)
                .collect(Collectors.toList());
    }
}
