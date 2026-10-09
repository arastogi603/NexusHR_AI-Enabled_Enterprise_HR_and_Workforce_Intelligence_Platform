package com.zidio.nexushr.employee.repository;

import com.zidio.nexushr.employee.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, UUID> {
    Optional<Attendance> findByEmployeeIdAndDate(UUID employeeId, LocalDate date);
    List<Attendance> findByEmployeeIdAndDateBetween(UUID employeeId, LocalDate from, LocalDate to);
    List<Attendance> findByEmployeeDepartmentIdAndDate(UUID departmentId, LocalDate date);
}
