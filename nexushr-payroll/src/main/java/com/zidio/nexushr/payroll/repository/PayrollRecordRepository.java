package com.zidio.nexushr.payroll.repository;

import com.zidio.nexushr.payroll.entity.PayrollRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, UUID> {
    List<PayrollRecord> findByEmployeeId(UUID employeeId);
    List<PayrollRecord> findByPayPeriodStartAndPayPeriodEnd(LocalDate start, LocalDate end);
}
