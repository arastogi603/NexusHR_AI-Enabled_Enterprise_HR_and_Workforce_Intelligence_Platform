package com.zidio.nexushr.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "sms_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmsLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "recipient_phone", nullable = false)
    private String recipientPhone;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(nullable = false, length = 50)
    @Builder.Default
    private String status = "DELIVERED";

    @Column(name = "sent_at")
    @Builder.Default
    private OffsetDateTime sentAt = OffsetDateTime.now();
}
