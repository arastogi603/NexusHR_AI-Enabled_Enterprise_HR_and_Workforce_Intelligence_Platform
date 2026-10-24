package com.zidio.nexushr.employee.repository;

import com.zidio.nexushr.employee.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, UUID> {
    List<Leave> findByEmployeeId(UUID employeeId);
    
    @Query("SELECT l FROM Leave l WHERE l.employee.manager.id = :managerId AND l.status = 'PENDING'")
    List<Leave> findPendingLeavesForManager(@Param("managerId") UUID managerId);

    @Query("SELECT l FROM Leave l WHERE l.employee.id = :employeeId AND l.status != 'REJECTED' AND l.status != 'CANCELLED' " +
           "AND ((l.startDate <= :endDate AND l.endDate >= :startDate))")
    List<Leave> findOverlappingLeaves(@Param("employeeId") UUID employeeId, 
                                      @Param("startDate") LocalDate startDate, 
                                      @Param("endDate") LocalDate endDate);
                                      
    List<Leave> findByEmployeeDepartmentIdAndStartDateLessThanEqualAndEndDateGreaterThanEqualAndStatus(
            UUID departmentId, LocalDate date1, LocalDate date2, String status);

    List<Leave> findByStatus(String status);
}
