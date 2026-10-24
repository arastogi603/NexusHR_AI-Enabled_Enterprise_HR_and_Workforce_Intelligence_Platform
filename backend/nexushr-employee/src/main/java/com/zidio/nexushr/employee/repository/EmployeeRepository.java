package com.zidio.nexushr.employee.repository;

import com.zidio.nexushr.employee.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    Optional<Employee> findByEmail(String email);
    Optional<Employee> findByEmployeeCode(String employeeCode);
    Optional<Employee> findByUserId(UUID userId);
    Page<Employee> findByDepartmentIdAndStatus(UUID departmentId, String status, Pageable pageable);
    Page<Employee> findByStatus(String status, Pageable pageable);
    long countByDepartmentId(UUID departmentId);
    long countByDepartmentIdAndStatus(UUID departmentId, String status);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Employee e WHERE e.manager.id = :managerId")
    java.util.List<Employee> findByManagerId(@org.springframework.data.repository.query.Param("managerId") UUID managerId);

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Employee e WHERE e.department.id = :departmentId")
    java.util.List<Employee> findByDepartmentId(@org.springframework.data.repository.query.Param("departmentId") UUID departmentId);
}
