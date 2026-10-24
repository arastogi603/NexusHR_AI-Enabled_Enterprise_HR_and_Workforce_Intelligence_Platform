package com.zidio.nexushr.notification.service;

import com.zidio.nexushr.notification.dto.AnnouncementDto;
import com.zidio.nexushr.notification.entity.Announcement;
import com.zidio.nexushr.notification.repository.AnnouncementRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public AnnouncementService(AnnouncementRepository announcementRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.announcementRepository = announcementRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<AnnouncementDto> getAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AnnouncementDto createAnnouncement(AnnouncementDto dto, String authorEmail, String authorName) {
        Announcement announcement = Announcement.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .authorName(authorName != null ? authorName : "HR Administration")
                .authorEmail(authorEmail)
                .priority(dto.getPriority() != null ? dto.getPriority() : "NORMAL")
                .targetDepartmentId(dto.getTargetDepartmentId())
                .createdAt(OffsetDateTime.now())
                .expiresAt(dto.getExpiresAt())
                .build();

        Announcement saved = announcementRepository.save(announcement);
        AnnouncementDto result = toDto(saved);

        // Broadcast to company-wide STOMP topic
        try {
            messagingTemplate.convertAndSend("/topic/announcements", result);
        } catch (Exception e) {
            log.warn("Failed to broadcast announcement to /topic/announcements: {}", e.getMessage());
        }

        return result;
    }

    private AnnouncementDto toDto(Announcement a) {
        return AnnouncementDto.builder()
                .id(a.getId())
                .title(a.getTitle())
                .content(a.getContent())
                .authorName(a.getAuthorName())
                .authorEmail(a.getAuthorEmail())
                .priority(a.getPriority())
                .targetDepartmentId(a.getTargetDepartmentId())
                .createdAt(a.getCreatedAt())
                .expiresAt(a.getExpiresAt())
                .build();
    }
}
