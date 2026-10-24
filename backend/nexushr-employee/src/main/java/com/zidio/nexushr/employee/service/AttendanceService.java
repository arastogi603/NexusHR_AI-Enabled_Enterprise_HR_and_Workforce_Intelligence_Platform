package com.zidio.nexushr.employee.service;

import com.zidio.nexushr.common.exception.BusinessRuleException;
import com.zidio.nexushr.common.exception.DuplicateResourceException;
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
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private static final LocalTime SHIFT_START = LocalTime.of(9, 30);
    private static final int GRACE_MINUTES = 15; // 09:45 AM threshold

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
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + email));

        LocalDate today = LocalDate.now();
        
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .orElse(new Attendance());

        if (attendance.getId() != null && attendance.getClockIn() != null) {
            throw new DuplicateResourceException("ALREADY_CLOCKED_IN: An active clock-in record already exists for today");
        }

        LocalDateTime now = LocalDateTime.now();
        attendance.setEmployee(employee);
        attendance.setDate(today);
        attendance.setClockIn(now);
        
        // Check if clocked in after 09:30 + 15 min grace (09:45)
        LocalTime cutoff = SHIFT_START.plusMinutes(GRACE_MINUTES);
        if (now.toLocalTime().isAfter(cutoff)) {
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
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + email));

        LocalDate today = LocalDate.now();
        
        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(employee.getId(), today)
                .orElseThrow(() -> new DuplicateResourceException("NOT_CLOCKED_IN: No clock-in record found for today. You must punch in first."));

        if (attendance.getClockOut() != null) {
            throw new DuplicateResourceException("ALREADY_CLOCKED_OUT: Shift has already been clocked out for today.");
        }

        LocalDateTime clockOutTime = LocalDateTime.now();
        attendance.setClockOut(clockOutTime);
        
        // Calculate work duration in minutes
        Duration duration = Duration.between(attendance.getClockIn(), clockOutTime);
        long workMinutes = duration.toMinutes();
        double hours = workMinutes / 60.0;
        attendance.setWorkHours(Math.round(hours * 100.0) / 100.0);

        // Attendance business rules per §9.1:
        // >= 480 min (8h) => PRESENT (or LATE)
        // 240 - 479 min (4h - 8h) => HALF_DAY
        // < 240 min (< 4h) => ABSENT
        if (workMinutes < 240) {
            attendance.setStatus("ABSENT");
        } else if (workMinutes < 480) {
            attendance.setStatus("HALF_DAY");
        } else if (!"LATE".equals(attendance.getStatus())) {
            attendance.setStatus("PRESENT");
        }

        attendance = attendanceRepository.save(attendance);
        return attendanceMapper.toDto(attendance);
    }

    public AttendanceDto getTodayAttendance(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + email));

        return attendanceRepository.findByEmployeeIdAndDate(employee.getId(), LocalDate.now())
                .map(attendanceMapper::toDto)
                .orElse(null);
    }

    public List<AttendanceDto> getAttendanceHistory(String email, LocalDate from, LocalDate to) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + email));

        return attendanceRepository.findByEmployeeIdAndDateBetween(employee.getId(), from, to).stream()
                .map(attendanceMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getDepartmentAttendance(UUID departmentId, LocalDate date) {
        return attendanceRepository.findByEmployeeDepartmentIdAndDate(departmentId, date).stream()
                .map(attendanceMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<AttendanceDto> getTeamAttendanceToday(String managerEmail) {
        Employee manager = employeeRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        LocalDate today = LocalDate.now();
        List<Employee> teamMembers = employeeRepository.findAll().stream()
                .filter(e -> e.getManager() != null && e.getManager().getId().equals(manager.getId()))
                .collect(Collectors.toList());

        List<AttendanceDto> list = new ArrayList<>();
        for (Employee member : teamMembers) {
            attendanceRepository.findByEmployeeIdAndDate(member.getId(), today)
                    .ifPresentOrElse(
                            att -> list.add(attendanceMapper.toDto(att)),
                            () -> {
                                AttendanceDto placeholder = new AttendanceDto();
                                placeholder.setEmployeeId(member.getId());
                                placeholder.setEmployeeName(member.getFirstName() + " " + member.getLastName());
                                placeholder.setDate(today);
                                placeholder.setStatus("NOT_CLOCKED_IN");
                                list.add(placeholder);
                            }
                    );
        }
        return list;
    }
}
