package com.zidio.nexushr.notification.repository;

import com.zidio.nexushr.notification.entity.EmailOutbox;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmailOutboxRepository extends JpaRepository<EmailOutbox, UUID> {

    @Query("SELECT e FROM EmailOutbox e WHERE e.status IN ('PENDING', 'FAILED') AND e.retryCount < e.maxRetries AND e.nextRetryAt <= :now ORDER BY e.createdAt ASC")
    List<EmailOutbox> findPendingRetries(@Param("now") OffsetDateTime now, Pageable pageable);
}
