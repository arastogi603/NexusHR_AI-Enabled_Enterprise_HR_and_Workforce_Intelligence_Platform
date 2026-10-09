package com.zidio.nexushr.performance.repository;

import com.zidio.nexushr.performance.entity.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, UUID> {
    List<PerformanceReview> findByEmployeeId(UUID employeeId);
    List<PerformanceReview> findByReviewerId(UUID reviewerId);
}
