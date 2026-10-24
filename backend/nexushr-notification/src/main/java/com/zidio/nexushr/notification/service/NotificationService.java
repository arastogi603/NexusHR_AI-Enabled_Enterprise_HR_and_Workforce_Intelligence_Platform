package com.zidio.nexushr.notification.service;

import com.zidio.nexushr.notification.dto.NotificationDto;
import com.zidio.nexushr.notification.entity.EmailOutbox;
import com.zidio.nexushr.notification.entity.Notification;
import com.zidio.nexushr.notification.entity.SmsLog;
import com.zidio.nexushr.notification.repository.EmailOutboxRepository;
import com.zidio.nexushr.notification.repository.NotificationRepository;
import com.zidio.nexushr.notification.repository.SmsLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final EmailOutboxRepository emailOutboxRepository;
    private final SmsLogRepository smsLogRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;

    public NotificationService(NotificationRepository notificationRepository,
                               EmailOutboxRepository emailOutboxRepository,
                               SmsLogRepository smsLogRepository,
                               SimpMessagingTemplate messagingTemplate,
                               EmailService emailService) {
        this.notificationRepository = notificationRepository;
        this.emailOutboxRepository = emailOutboxRepository;
        this.smsLogRepository = smsLogRepository;
        this.messagingTemplate = messagingTemplate;
        this.emailService = emailService;
    }

    public Page<NotificationDto> getNotifications(String recipientEmail, boolean unreadOnly, Pageable pageable) {
        Page<Notification> page = unreadOnly
                ? notificationRepository.findByRecipientEmailAndIsReadFalseOrderByCreatedAtDesc(recipientEmail, pageable)
                : notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(recipientEmail, pageable);

        return page.map(this::toDto);
    }

    public long getUnreadCount(String recipientEmail) {
        return notificationRepository.countByRecipientEmailAndIsReadFalse(recipientEmail);
    }

    @Transactional
    public NotificationDto markAsRead(UUID id, String recipientEmail) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        if (!notification.getRecipientEmail().equalsIgnoreCase(recipientEmail)) {
            throw new RuntimeException("Unauthorized: Notification does not belong to user");
        }

        notification.setRead(true);
        notification.setReadAt(OffsetDateTime.now());
        Notification saved = notificationRepository.save(notification);
        return toDto(saved);
    }

    @Transactional
    public void markAllAsRead(String recipientEmail) {
        notificationRepository.markAllAsRead(recipientEmail);
    }

    @Transactional
    public NotificationDto sendNotification(String recipientEmail,
                                           String subject,
                                           String message,
                                           String type,
                                           String link,
                                           boolean sendEmail,
                                           String phone) {
        // 1. Persist notification to DB so it survives offline
        Notification entity = Notification.builder()
                .recipientEmail(recipientEmail)
                .subject(subject)
                .message(message)
                .type(type != null ? type : "SYSTEM")
                .link(link)
                .isRead(false)
                .createdAt(OffsetDateTime.now())
                .build();

        Notification saved = notificationRepository.save(entity);
        NotificationDto dto = toDto(saved);

        // 2. Real-time STOMP broadcast (User Queue & direct topic for fallback)
        try {
            messagingTemplate.convertAndSendToUser(recipientEmail, "/queue/notifications", dto);
            messagingTemplate.convertAndSend("/topic/notifications-" + recipientEmail, dto);
        } catch (Exception e) {
            log.warn("STOMP push failed for {}: {}", recipientEmail, e.getMessage());
        }

        // 3. Email Outbox queuing & dispatch
        if (sendEmail) {
            String htmlBody = buildHtmlEmail(subject, message, link);
            EmailOutbox outbox = EmailOutbox.builder()
                    .recipientEmail(recipientEmail)
                    .subject(subject)
                    .bodyHtml(htmlBody)
                    .status("PENDING")
                    .retryCount(0)
                    .maxRetries(3)
                    .nextRetryAt(OffsetDateTime.now())
                    .createdAt(OffsetDateTime.now())
                    .build();

            EmailOutbox savedOutbox = emailOutboxRepository.save(outbox);
            // Attempt immediate dispatch
            try {
                emailService.sendSimpleMessage(recipientEmail, subject, message);
                savedOutbox.setStatus("SENT");
                savedOutbox.setSentAt(OffsetDateTime.now());
                emailOutboxRepository.save(savedOutbox);
            } catch (Exception ex) {
                log.info("Immediate email dispatch queued to outbox for retry: {}", ex.getMessage());
            }
        }

        // 4. Simulated SMS dispatch
        if (phone != null && !phone.isBlank()) {
            SmsLog smsLog = SmsLog.builder()
                    .recipientPhone(phone)
                    .message(message)
                    .status("DELIVERED")
                    .sentAt(OffsetDateTime.now())
                    .build();
            smsLogRepository.save(smsLog);
            log.info("[SIMULATED SMS] Sent to {}: {}", phone, message);
        }

        return dto;
    }

    private String buildHtmlEmail(String subject, String message, String link) {
        String actionButton = link != null && !link.isBlank()
                ? "<div style='margin-top:24px;'><a href='" + link + "' style='background:#4f46e5;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;'>View in NexusHR</a></div>"
                : "";

        return "<div style='font-family:Inter,Segoe UI,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;'>" +
                "<div style='border-bottom:2px solid #4f46e5;padding-bottom:12px;margin-bottom:16px;'>" +
                "<h2 style='color:#1e293b;margin:0;font-size:20px;'>Nexus<span style='color:#4f46e5;'>HR</span> Alert</h2>" +
                "</div>" +
                "<h3 style='color:#334155;margin-top:0;'>" + subject + "</h3>" +
                "<p style='color:#475569;font-size:15px;line-height:1.6;'>" + message + "</p>" +
                actionButton +
                "<div style='margin-top:32px;border-top:1px solid #e2e8f0;padding-top:12px;font-size:12px;color:#94a3b8;'>" +
                "This is an automated notification from your NexusHR Workforce System." +
                "</div>" +
                "</div>";
    }

    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .recipientEmail(n.getRecipientEmail())
                .subject(n.getSubject())
                .message(n.getMessage())
                .type(n.getType())
                .link(n.getLink())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .readAt(n.getReadAt())
                .build();
    }
}
