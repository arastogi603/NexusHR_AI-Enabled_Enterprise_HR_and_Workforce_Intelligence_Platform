package com.zidio.nexushr.notification.service;

import com.zidio.nexushr.notification.entity.EmailOutbox;
import com.zidio.nexushr.notification.repository.EmailOutboxRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
@Slf4j
public class EmailOutboxProcessor {

    private final EmailOutboxRepository emailOutboxRepository;
    private final EmailService emailService;

    public EmailOutboxProcessor(EmailOutboxRepository emailOutboxRepository, EmailService emailService) {
        this.emailOutboxRepository = emailOutboxRepository;
        this.emailService = emailService;
    }

    @Scheduled(fixedDelay = 30000) // Runs every 30 seconds
    @Transactional
    public void processOutboxRetries() {
        OffsetDateTime now = OffsetDateTime.now();
        List<EmailOutbox> pendingRetries = emailOutboxRepository.findPendingRetries(now, PageRequest.of(0, 20));

        if (pendingRetries.isEmpty()) {
            return;
        }

        log.debug("Processing {} pending email outbox retries...", pendingRetries.size());

        for (EmailOutbox item : pendingRetries) {
            try {
                emailService.sendSimpleMessage(item.getRecipientEmail(), item.getSubject(), item.getBodyHtml());
                item.setStatus("SENT");
                item.setSentAt(OffsetDateTime.now());
                item.setLastError(null);
                log.info("Email outbox retry succeeded for item {}", item.getId());
            } catch (Exception ex) {
                int nextRetry = item.getRetryCount() + 1;
                item.setRetryCount(nextRetry);
                item.setLastError(ex.getMessage());

                if (nextRetry >= item.getMaxRetries()) {
                    item.setStatus("FAILED");
                    log.error("Email outbox retry exceeded max retries for item {}", item.getId());
                } else {
                    // Exponential backoff: 1 min, 4 mins, 9 mins
                    long delayMinutes = (long) Math.pow(nextRetry, 2);
                    item.setNextRetryAt(now.plusMinutes(delayMinutes));
                    log.warn("Email outbox item {} failed (attempt {}). Next retry at {}", item.getId(), nextRetry, item.getNextRetryAt());
                }
            }
            emailOutboxRepository.save(item);
        }
    }
}
