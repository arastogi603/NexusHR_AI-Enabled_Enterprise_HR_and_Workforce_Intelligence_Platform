package com.zidio.nexushr.notification.dto;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private UUID id;
    private String recipientEmail;
    private String subject;
    private String message;
    private String type;
    private String link;
    private boolean isRead;
    private OffsetDateTime createdAt;
    private OffsetDateTime readAt;
}
