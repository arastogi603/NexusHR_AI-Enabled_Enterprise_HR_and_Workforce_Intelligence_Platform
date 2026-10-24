package com.zidio.nexushr.notification.repository;

import com.zidio.nexushr.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    Page<Notification> findByRecipientEmailOrderByCreatedAtDesc(String recipientEmail, Pageable pageable);

    Page<Notification> findByRecipientEmailAndIsReadFalseOrderByCreatedAtDesc(String recipientEmail, Pageable pageable);

    long countByRecipientEmailAndIsReadFalse(String recipientEmail);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.recipientEmail = :email AND n.isRead = false")
    void markAllAsRead(@Param("email") String email);
}
