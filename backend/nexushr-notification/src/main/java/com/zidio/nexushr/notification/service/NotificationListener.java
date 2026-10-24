package com.zidio.nexushr.notification.service;

import com.zidio.nexushr.common.event.NotificationEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationListener {

    private final NotificationService notificationService;

    public NotificationListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        notificationService.sendNotification(
                event.getRecipientEmail(),
                event.getSubject(),
                event.getMessage(),
                "SYSTEM",
                null,
                event.isSendEmail(),
                null
        );
    }
}
