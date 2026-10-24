package com.zidio.nexushr.employee.repository;

import com.zidio.nexushr.employee.entity.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, UUID> {
    List<EmployeeDocument> findByEmployeeIdOrderByCreatedAtDesc(UUID employeeId);
}
