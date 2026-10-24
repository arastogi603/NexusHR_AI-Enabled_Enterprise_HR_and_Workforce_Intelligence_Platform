package com.zidio.nexushr.employee.repository;

import com.zidio.nexushr.employee.entity.EmployeeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeHistoryRepository extends JpaRepository<EmployeeHistory, UUID> {
    @Query("SELECT h FROM EmployeeHistory h WHERE h.employee.id = :employeeId ORDER BY h.createdAt DESC")
    List<EmployeeHistory> findByEmployeeIdOrderByCreatedAtDesc(@Param("employeeId") UUID employeeId);
}
