package com.zidio.nexushr.auth.service;

import com.zidio.nexushr.auth.entity.AuditLog;
import com.zidio.nexushr.auth.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuditLog logAction(String entityType, UUID entityId, String action, String performedBy, String ip, String oldValue, String newValue) {
        String prevHash = auditLogRepository.findTopByOrderByTimestampDesc()
                .map(AuditLog::getHash)
                .orElse("0000000000000000000000000000000000000000000000000000000000000000");

        LocalDateTime now = LocalDateTime.now();
        String payload = prevHash + "|" + entityType + "|" + entityId + "|" + action + "|" + performedBy + "|" + now;
        String currentHash = calculateSha256(payload);

        AuditLog log = new AuditLog();
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setAction(action);
        log.setPerformedBy(performedBy);
        log.setIp(ip);
        log.setOldValue(oldValue);
        log.setNewValue(newValue);
        log.setTimestamp(now);
        log.setPrevHash(prevHash);
        log.setHash(currentHash);

        return auditLogRepository.save(log);
    }

    public Page<AuditLog> getLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    public Map<String, Object> verifyIntegrity() {
        List<AuditLog> allLogs = auditLogRepository.findAllByOrderByTimestampAsc();
        String expectedPrev = "0000000000000000000000000000000000000000000000000000000000000000";

        for (int i = 0; i < allLogs.size(); i++) {
            AuditLog item = allLogs.get(i);
            if (!expectedPrev.equals(item.getPrevHash())) {
                return Map.of(
                        "verified", false,
                        "brokenIndex", i,
                        "brokenLogId", item.getId(),
                        "message", "Hash chain broken at log ID: " + item.getId()
                );
            }

            String payload = item.getPrevHash() + "|" + item.getEntityType() + "|" + item.getEntityId() + "|"
                    + item.getAction() + "|" + item.getPerformedBy() + "|" + item.getTimestamp();
            String computedHash = calculateSha256(payload);

            if (!computedHash.equals(item.getHash())) {
                return Map.of(
                        "verified", false,
                        "brokenIndex", i,
                        "brokenLogId", item.getId(),
                        "message", "Hash mismatch at log ID: " + item.getId()
                );
            }

            expectedPrev = item.getHash();
        }

        Map<String, Object> result = new HashMap<>();
        result.put("verified", true);
        result.put("totalRecords", allLogs.size());
        result.put("latestHash", expectedPrev);
        result.put("message", "Audit log hash chain is completely intact and verified.");
        return result;
    }

    private String calculateSha256(String text) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(text.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
