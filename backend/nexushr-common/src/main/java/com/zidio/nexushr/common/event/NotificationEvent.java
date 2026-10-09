package com.zidio.nexushr.common.event;

import lombok.Builder;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class NotificationEvent extends ApplicationEvent {
    
    private final String recipientEmail;
    private final String subject;
    private final String message;
    private final boolean sendEmail;

    @Builder
    public NotificationEvent(Object source, String recipientEmail, String subject, String message, boolean sendEmail) {
        super(source);
        this.recipientEmail = recipientEmail;
        this.subject = subject;
        this.message = message;
        this.sendEmail = sendEmail;
    }
}
