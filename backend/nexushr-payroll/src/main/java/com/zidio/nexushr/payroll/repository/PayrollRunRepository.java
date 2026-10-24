package com.zidio.nexushr.payroll.repository;

import com.zidio.nexushr.payroll.entity.PayrollRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PayrollRunRepository extends JpaRepository<PayrollRun, UUID> {
    Optional<PayrollRun> findByMonthAndYear(int month, int year);
    List<PayrollRun> findAllByOrderByYearDescMonthDesc();
}
