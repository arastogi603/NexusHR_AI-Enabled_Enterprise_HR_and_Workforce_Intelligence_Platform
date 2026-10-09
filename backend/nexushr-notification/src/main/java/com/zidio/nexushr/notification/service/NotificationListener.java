package com.zidio.nexushr.notification.service;

import com.zidio.nexushr.common.event.NotificationEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationListener {

    private final SimpMessagingTemplate messagingTemplate;
    private final EmailService emailService;

    public NotificationListener(SimpMessagingTemplate messagingTemplate, EmailService emailService) {
        this.messagingTemplate = messagingTemplate;
        this.emailService = emailService;
    }

    @EventListener
    public void handleNotificationEvent(NotificationEvent event) {
        // 1. Push Real-time WebSocket Notification
        String destination = "/queue/notifications-" + event.getRecipientEmail();
        Map<String, String> payload = Map.of(
            "subject", event.getSubject(),
            "message", event.getMessage()
        );
        
        messagingTemplate.convertAndSend(destination, payload);
        
        // 2. Dispatch Email if requested
        if (event.isSendEmail()) {
            emailService.sendSimpleMessage(event.getRecipientEmail(), event.getSubject(), event.getMessage());
        }
    }
}
