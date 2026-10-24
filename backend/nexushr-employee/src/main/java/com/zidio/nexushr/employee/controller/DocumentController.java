package com.zidio.nexushr.employee.controller;

import com.zidio.nexushr.employee.dto.DocumentDto;
import com.zidio.nexushr.employee.entity.EmployeeDocument;
import com.zidio.nexushr.employee.service.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/employees/{employeeId}/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<DocumentDto>> getEmployeeDocuments(@PathVariable UUID employeeId) {
        return ResponseEntity.ok(documentService.getEmployeeDocuments(employeeId));
    }

    @PostMapping(value = "/employees/{employeeId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<DocumentDto> uploadDocument(
            @PathVariable UUID employeeId,
            @RequestParam("type") String documentType,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        DocumentDto uploaded = documentService.uploadDocument(employeeId, documentType, file, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(uploaded);
    }

    @GetMapping("/documents/{documentId}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID documentId) {
        Resource resource = documentService.loadDocumentAsResource(documentId);
        EmployeeDocument entity = documentService.getDocumentEntity(documentId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(entity.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + entity.getFileName() + "\"")
                .body(resource);
    }

    @PutMapping("/documents/{documentId}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DocumentDto> verifyDocument(
            @PathVariable UUID documentId,
            Authentication authentication) {
        return ResponseEntity.ok(documentService.verifyDocument(documentId, authentication.getName()));
    }

    @DeleteMapping("/documents/{documentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDocument(@PathVariable UUID documentId) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
    }
}
