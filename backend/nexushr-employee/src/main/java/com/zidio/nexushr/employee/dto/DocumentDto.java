package com.zidio.nexushr.employee.dto;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentDto {
    private UUID id;
    private UUID employeeId;
    private String documentType;
    private String fileName;
    private long fileSize;
    private String contentType;
    private String uploadedBy;
    private boolean verified;
    private String verifiedBy;
    private OffsetDateTime verifiedAt;
    private OffsetDateTime createdAt;
}
