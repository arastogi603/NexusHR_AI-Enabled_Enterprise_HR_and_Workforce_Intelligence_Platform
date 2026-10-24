package com.zidio.nexushr.auth.repository;

import com.zidio.nexushr.auth.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    Page<AuditLog> findByEntityTypeOrderByTimestampDesc(String entityType, Pageable pageable);
    List<AuditLog> findAllByOrderByTimestampAsc();
    Optional<AuditLog> findTopByOrderByTimestampDesc();
}
