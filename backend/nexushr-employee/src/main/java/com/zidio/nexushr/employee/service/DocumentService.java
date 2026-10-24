package com.zidio.nexushr.employee.service;

import com.zidio.nexushr.common.exception.BusinessRuleException;
import com.zidio.nexushr.common.exception.ResourceNotFoundException;
import com.zidio.nexushr.employee.dto.DocumentDto;
import com.zidio.nexushr.employee.entity.EmployeeDocument;
import com.zidio.nexushr.employee.repository.EmployeeDocumentRepository;
import com.zidio.nexushr.employee.repository.EmployeeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DocumentService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB limit
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/jpg"
    );

    private final Path rootStorageLocation = Paths.get("uploads", "documents");
    private final EmployeeDocumentRepository documentRepository;
    private final EmployeeRepository employeeRepository;

    public DocumentService(EmployeeDocumentRepository documentRepository,
                           EmployeeRepository employeeRepository) {
        this.documentRepository = documentRepository;
        this.employeeRepository = employeeRepository;
        try {
            Files.createDirectories(rootStorageLocation);
        } catch (IOException e) {
            log.error("Failed to initialize document upload storage directory", e);
        }
    }

    public List<DocumentDto> getEmployeeDocuments(UUID employeeId) {
        return documentRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentDto uploadDocument(UUID employeeId,
                                      String documentType,
                                      MultipartFile file,
                                      String uploadedBy) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found with id: " + employeeId);
        }

        if (file.isEmpty()) {
            throw new BusinessRuleException("Cannot upload empty file");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessRuleException("File size exceeds 5MB limit");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BusinessRuleException("Unsupported file type. Allowed: PDF, PNG, JPEG");
        }

        // Magic-byte signature verification
        validateMagicBytes(file, contentType);

        String cleanFilename = Paths.get(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document").getFileName().toString();
        String storedFileName = UUID.randomUUID() + "_" + cleanFilename;
        Path targetPath = rootStorageLocation.resolve(storedFileName);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to store file {}", cleanFilename, e);
            throw new RuntimeException("Could not store file: " + e.getMessage());
        }

        EmployeeDocument doc = EmployeeDocument.builder()
                .employeeId(employeeId)
                .documentType(documentType != null ? documentType.toUpperCase() : "OTHER")
                .fileName(cleanFilename)
                .fileSize(file.getSize())
                .contentType(contentType)
                .storagePath(targetPath.toAbsolutePath().toString())
                .uploadedBy(uploadedBy)
                .verified(false)
                .createdAt(OffsetDateTime.now())
                .build();

        EmployeeDocument saved = documentRepository.save(doc);
        return toDto(saved);
    }

    public Resource loadDocumentAsResource(UUID documentId) {
        EmployeeDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        try {
            Path file = Paths.get(doc.getStoragePath());
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Could not read file: " + doc.getFileName());
            }
        } catch (Exception e) {
            throw new ResourceNotFoundException("File not found or unreadable: " + doc.getFileName());
        }
    }

    public EmployeeDocument getDocumentEntity(UUID documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));
    }

    @Transactional
    public DocumentDto verifyDocument(UUID documentId, String verifiedBy) {
        EmployeeDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        doc.setVerified(true);
        doc.setVerifiedBy(verifiedBy);
        doc.setVerifiedAt(OffsetDateTime.now());
        return toDto(documentRepository.save(doc));
    }

    @Transactional
    public void deleteDocument(UUID documentId) {
        EmployeeDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        try {
            Files.deleteIfExists(Paths.get(doc.getStoragePath()));
        } catch (IOException e) {
            log.warn("Could not delete physical file: {}", doc.getStoragePath());
        }
        documentRepository.delete(doc);
    }

    private void validateMagicBytes(MultipartFile file, String contentType) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[8];
            int read = is.read(header);
            if (read < 4) {
                throw new BusinessRuleException("Corrupted or invalid file header");
            }

            if ("application/pdf".equalsIgnoreCase(contentType)) {
                // PDF magic bytes: %PDF- (0x25 0x50 0x44 0x46)
                if (header[0] != 0x25 || header[1] != 0x50 || header[2] != 0x44 || header[3] != 0x46) {
                    throw new BusinessRuleException("Invalid PDF file signature");
                }
            } else if ("image/png".equalsIgnoreCase(contentType)) {
                // PNG magic bytes: \x89PNG
                if ((header[0] & 0xFF) != 0x89 || header[1] != 0x50 || header[2] != 0x4E || header[3] != 0x47) {
                    throw new BusinessRuleException("Invalid PNG image signature");
                }
            } else if ("image/jpeg".equalsIgnoreCase(contentType) || "image/jpg".equalsIgnoreCase(contentType)) {
                // JPEG magic bytes: FF D8 FF
                if ((header[0] & 0xFF) != 0xFF || (header[1] & 0xFF) != 0xD8 || (header[2] & 0xFF) != 0xFF) {
                    throw new BusinessRuleException("Invalid JPEG image signature");
                }
            }
        } catch (IOException e) {
            throw new BusinessRuleException("Could not verify file content stream");
        }
    }

    private DocumentDto toDto(EmployeeDocument d) {
        return DocumentDto.builder()
                .id(d.getId())
                .employeeId(d.getEmployeeId())
                .documentType(d.getDocumentType())
                .fileName(d.getFileName())
                .fileSize(d.getFileSize())
                .contentType(d.getContentType())
                .uploadedBy(d.getUploadedBy())
                .verified(d.isVerified())
                .verifiedBy(d.getVerifiedBy())
                .verifiedAt(d.getVerifiedAt())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
