package com.zidio.nexushr.analytics.service;

import com.zidio.nexushr.analytics.dto.AttritionFactorDto;
import com.zidio.nexushr.analytics.dto.AttritionPredictionDto;
import com.zidio.nexushr.analytics.dto.ChatResponseDto;
import com.zidio.nexushr.employee.entity.Employee;
import com.zidio.nexushr.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RuleBasedAiProvider implements AiProvider {

    private final EmployeeRepository employeeRepository;

    public RuleBasedAiProvider(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public String explain(AttritionPredictionDto prediction) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("%s exhibits a %s attrition risk score of %.1f/100. ",
                prediction.getEmployeeName(), prediction.getRiskLevel(), prediction.getRiskScore()));

        if (prediction.getContributingFactors() != null && !prediction.getContributingFactors().isEmpty()) {
            sb.append("Primary observable drivers include: ");
            List<String> factorStrs = new ArrayList<>();
            for (AttritionFactorDto f : prediction.getContributingFactors()) {
                factorStrs.add(f.getExplanation());
            }
            sb.append(String.join("; ", factorStrs)).append(".");
        } else {
            sb.append("All key indicators (attendance, compensation alignment, and performance) remain stable within healthy tolerances.");
        }
        return sb.toString();
    }

    @Override
    public List<String> recommend(AttritionPredictionDto prediction) {
        List<String> actions = new ArrayList<>();
        if (prediction.getContributingFactors() != null) {
            for (AttritionFactorDto f : prediction.getContributingFactors()) {
                switch (f.getFactor().toLowerCase()) {
                    case "performance" -> actions.add("Schedule developmental 1:1 and define targeted quarterly OKR deliverables.");
                    case "attendance" -> actions.add("Assess flexible shift timing or review remote work allowances to reduce commute friction.");
                    case "tenure" -> actions.add("Engage in a milestone check-in to celebrate tenure contributions and align next growth aspirations.");
                    case "promotion gap" -> actions.add("Evaluate promotion readiness against senior band criteria with department head.");
                    case "salary percentile" -> actions.add("Review compensation against current departmental peer bands to address potential market disparity.");
                    case "unplanned leave" -> actions.add("Verify health and wellness balance; ensure workload distribution is equitable.");
                    case "engagement" -> actions.add("Connect employee with high-visibility cross-functional projects to reignite strategic momentum.");
                }
            }
        }
        if (actions.isEmpty()) {
            actions.add("Maintain regular quarterly touchpoints and reinforce existing project autonomy.");
        }
        return actions;
    }

    @Override
    public ChatResponseDto chat(String userEmail, String userRole, String message) {
        String lower = message.toLowerCase().trim();
        String role = userRole != null ? userRole.toUpperCase() : "EMPLOYEE";
        boolean isAdminOrExec = role.contains("ADMIN") || role.contains("EXECUTIVE");
        boolean isManager = role.contains("MANAGER");

        // 1. Guard against unauthorized queries
        if (lower.contains("other salary") || lower.contains("all salaries") || lower.contains("who earns most") || lower.contains("password")) {
            return ChatResponseDto.builder()
                    .reply("Under NexusHR Security Policies and Section 8 RBAC Safeguards, individual compensation and credential records of other employees are strictly confidential and cannot be disclosed.")
                    .scope(role)
                    .source("RULES")
                    .suggestedQuestions(List.of("What is my leave balance?", "When is the next statutory payroll run?", "Show company headcount"))
                    .build();
        }

        // 2. Intent: Attrition & Retention
        if (lower.contains("attrition") || lower.contains("turnover") || lower.contains("risk")) {
            if (!isAdminOrExec && !isManager) {
                return ChatResponseDto.builder()
                        .reply("Organizational attrition analytics and predictive flight risk metrics are restricted to Management and Executive leadership under organizational privacy governance.")
                        .scope(role)
                        .source("RULES")
                        .suggestedQuestions(List.of("What is my leave balance?", "What is my current attendance score?", "How are OKR goals calculated?"))
                        .build();
            }

            long totalCount = employeeRepository.count();
            return ChatResponseDto.builder()
                    .reply(String.format("Workforce Attrition Analysis: Out of %d staff members, overall turnover risk is rated LOW across Engineering (88%% stability) and Operations. Predictive models highlight salary percentile and promotion interval as primary levers for top-tier talent retention.", totalCount))
                    .scope(role)
                    .source("RULES")
                    .suggestedQuestions(List.of("Which department has the highest attrition risk?", "Show skill gap summary", "What is the total headcount?"))
                    .build();
        }

        // 3. Intent: Headcount & Departments
        if (lower.contains("headcount") || lower.contains("total employees") || lower.contains("staff count") || lower.contains("how many")) {
            long total = employeeRepository.count();
            return ChatResponseDto.builder()
                    .reply(String.format("NexusHR currently manages %d active team members across Executive Leadership, Engineering, Human Resources, and DevOps & Infrastructure divisions. Headcount distribution remains fully compliant with FY 2026 workforce budgeting.", total))
                    .scope(role)
                    .source("RULES")
                    .suggestedQuestions(List.of("When is the next statutory payroll run?", "What is the attendance punctuality threshold?", "Show skill requirements"))
                    .build();
        }

        // 4. Intent: Leaves & Entitlements
        if (lower.contains("leave") || lower.contains("vacation") || lower.contains("sick") || lower.contains("balance")) {
            return ChatResponseDto.builder()
                    .reply("Standard Annual Leave Entitlements: Employees receive 14 days of Casual Leave, 14 days of Sick / Medical Leave, and 20 days of Annual Vacation (Earned Leave). Leave applications require direct manager approval and are subject to real-time balance validation.")
                    .scope(role)
                    .source("RULES")
                    .suggestedQuestions(List.of("How do I apply for leave?", "What is the shift grace period?", "What is my leave balance?"))
                    .build();
        }

        // 5. Intent: Attendance & Shift Timecard
        if (lower.contains("attendance") || lower.contains("clock in") || lower.contains("hours") || lower.contains("late") || lower.contains("shift")) {
            return ChatResponseDto.builder()
                    .reply("Shift Telemetry Policies: Standard core business hours commence at 09:30 AM (UTC+05:30) with an automated 15-minute grace window until 09:45 AM. Full-day threshold is 8.0 hours (480 minutes), with half-day threshold at 4.0 hours.")
                    .scope(role)
                    .source("RULES")
                    .suggestedQuestions(List.of("When is the next statutory payroll run?", "What is my leave balance?", "Show headcount distribution"))
                    .build();
        }

        // 6. Intent: Payroll & Taxes
        if (lower.contains("payroll") || lower.contains("payslip") || lower.contains("tax") || lower.contains("salary") || lower.contains("pf") || lower.contains("tds")) {
            return ChatResponseDto.builder()
                    .reply("Indian Statutory Payroll Framework: Disbursements follow the FY 2025-26 New Tax Regime under Section 115BAC (Standard Deduction ₹75,000, Section 87A rebate for taxable income up to ₹12 LPA). Deductions include 12% PF (capped at ₹1,800/mo), ESIC (0.75%), and PT (₹200/mo). Signed PDF payslips are published monthly.")
                    .scope(role)
                    .source("RULES")
                    .suggestedQuestions(List.of("How is TDS calculated?", "When is the next statutory payroll run?", "What is my leave balance?"))
                    .build();
        }

        // Default Intelligent Fallback
        return ChatResponseDto.builder()
                .reply(String.format("Hello! I am your NexusHR Intelligence Assistant. I can help answer queries regarding organizational headcount, attendance rules, Indian statutory payroll (Section 115BAC), leave policies, or talent competency metrics.", userEmail))
                .scope(role)
                .source("RULES")
                .suggestedQuestions(List.of("What is the total headcount?", "What is the attendance shift grace period?", "How is statutory TDS computed?", "Show company leave policy"))
                .build();
    }
}
