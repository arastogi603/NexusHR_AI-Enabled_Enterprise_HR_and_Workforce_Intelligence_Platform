package com.zidio.nexushr.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnouncementDto {
    private UUID id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private String authorName;
    private String authorEmail;
    private String priority; // NORMAL, HIGH, URGENT
    private UUID targetDepartmentId;
    private OffsetDateTime createdAt;
    private OffsetDateTime expiresAt;
}
