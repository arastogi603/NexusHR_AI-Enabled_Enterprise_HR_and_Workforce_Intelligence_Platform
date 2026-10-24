package com.zidio.nexushr.analytics.service;

import com.zidio.nexushr.analytics.dto.SkillGapDto;
import com.zidio.nexushr.employee.entity.Department;
import com.zidio.nexushr.employee.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class SkillGapService {

    private final DepartmentRepository departmentRepository;

    public SkillGapService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<SkillGapDto> getSkillGaps(UUID departmentId) {
        List<SkillGapDto> allGaps = new ArrayList<>();

        // Standard Catalog Mapping
        allGaps.add(SkillGapDto.builder()
                .departmentName("Engineering")
                .designation("Senior Software Developer")
                .skill("Distributed Systems & Reactive Microservices")
                .requiredLevel(4)
                .currentProficiency(3.2)
                .gap(0.8)
                .criticality(3)
                .priorityScore(2.4)
                .suggestedTraining("Reactive Spring Cloud Gateway & Resilient Event Mesh")
                .build());

        allGaps.add(SkillGapDto.builder()
                .departmentName("Engineering")
                .designation("Software Engineer")
                .skill("PostgreSQL Database Indexing & Query Tuning")
                .requiredLevel(4)
                .currentProficiency(3.5)
                .gap(0.5)
                .criticality(2)
                .priorityScore(1.0)
                .suggestedTraining("Postgres 17 Query Optimizer & Partitioning Deep Dive")
                .build());

        allGaps.add(SkillGapDto.builder()
                .departmentName("DevOps & Infrastructure")
                .designation("DevOps Engineer")
                .skill("Kubernetes Cluster Automation & Helm")
                .requiredLevel(5)
                .currentProficiency(4.1)
                .gap(0.9)
                .criticality(3)
                .priorityScore(2.7)
                .suggestedTraining("Zero-Downtime Rolling Deploys with Minikube & K8s Operators")
                .build());

        allGaps.add(SkillGapDto.builder()
                .departmentName("Human Resources")
                .designation("HR Business Partner")
                .skill("Indian Statutory Payroll & Section 115BAC Compliance")
                .requiredLevel(5)
                .currentProficiency(4.3)
                .gap(0.7)
                .criticality(3)
                .priorityScore(2.1)
                .suggestedTraining("FY 2025-26 New Tax Regime Audit & Statutory Formula Certification")
                .build());

        allGaps.add(SkillGapDto.builder()
                .departmentName("Executive Leadership")
                .designation("Executive Director")
                .skill("Strategic Workforce AI & Predictive Analytics")
                .requiredLevel(4)
                .currentProficiency(3.4)
                .gap(0.6)
                .criticality(2)
                .priorityScore(1.2)
                .suggestedTraining("AI-Driven Attrition Mitigation & Talent Retention Strategy")
                .build());

        if (departmentId != null) {
            Department dept = departmentRepository.findById(departmentId).orElse(null);
            if (dept != null) {
                allGaps = allGaps.stream()
                        .filter(g -> g.getDepartmentName().equalsIgnoreCase(dept.getName()))
                        .collect(Collectors.toList());
            }
        }

        // Sort by priorityScore descending
        allGaps.sort((a, b) -> Double.compare(b.getPriorityScore(), a.getPriorityScore()));
        return allGaps;
    }
}
