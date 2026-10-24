package com.zidio.nexushr.notification.repository;

import com.zidio.nexushr.notification.entity.SmsLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SmsLogRepository extends JpaRepository<SmsLog, UUID> {
}
