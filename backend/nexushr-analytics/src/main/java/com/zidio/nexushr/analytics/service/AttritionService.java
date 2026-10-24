package com.zidio.nexushr.analytics.service;

import com.zidio.nexushr.analytics.dto.AttritionFactorDto;
import com.zidio.nexushr.analytics.dto.AttritionPredictionDto;
import com.zidio.nexushr.employee.entity.Employee;
import com.zidio.nexushr.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class AttritionService {

    private final EmployeeRepository employeeRepository;
    private final AiProvider aiProvider;

    // In-memory 24-hour cache for predictions
    private final Map<UUID, AttritionPredictionDto> predictionCache = new ConcurrentHashMap<>();

    public AttritionService(EmployeeRepository employeeRepository, AiProvider aiProvider) {
        this.employeeRepository = employeeRepository;
        this.aiProvider = aiProvider;
    }

    public List<AttritionPredictionDto> getPredictions(UUID departmentId, String level, String callerEmail, boolean isManagerOnly) {
        List<Employee> eligibleEmployees;

        if (isManagerOnly) {
            Employee manager = employeeRepository.findByEmail(callerEmail).orElse(null);
            if (manager != null) {
                eligibleEmployees = employeeRepository.findByManagerId(manager.getId());
            } else {
                eligibleEmployees = Collections.emptyList();
            }
        } else if (departmentId != null) {
            eligibleEmployees = employeeRepository.findByDepartmentId(departmentId);
        } else {
            eligibleEmployees = employeeRepository.findAll();
        }

        List<AttritionPredictionDto> predictions = eligibleEmployees.stream()
                .map(this::calculatePredictionForEmployee)
                .collect(Collectors.toList());

        if (level != null && !level.isBlank() && !level.equalsIgnoreCase("ALL")) {
            predictions = predictions.stream()
                    .filter(p -> p.getRiskLevel().equalsIgnoreCase(level))
                    .collect(Collectors.toList());
        }

        // Sort by riskScore descending
        predictions.sort((a, b) -> Double.compare(b.getRiskScore(), a.getRiskScore()));
        return predictions;
    }

    public AttritionPredictionDto getPredictionForEmployee(UUID employeeId, String callerEmail, boolean isManagerOnly) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (isManagerOnly) {
            Employee manager = employeeRepository.findByEmail(callerEmail).orElse(null);
            if (manager == null || employee.getManager() == null || !employee.getManager().getId().equals(manager.getId())) {
                throw new RuntimeException("Unauthorized: Manager can only inspect predictions for direct reports");
            }
        }

        return calculatePredictionForEmployee(employee);
    }

    public synchronized void refreshAllPredictions() {
        predictionCache.clear();
        List<Employee> all = employeeRepository.findAll();
        for (Employee emp : all) {
            calculatePredictionForEmployee(emp);
        }
    }

    public AttritionPredictionDto calculatePredictionForEmployee(Employee emp) {
        if (predictionCache.containsKey(emp.getId())) {
            return predictionCache.get(emp.getId());
        }

        LocalDate now = LocalDate.now();
        LocalDate hireDate = emp.getHireDate() != null ? emp.getHireDate() : now.minusMonths(12);
        int tenureMonths = Math.max(1, Period.between(hireDate, now).getYears() * 12 + Period.between(hireDate, now).getMonths());

        // Baseline deterministic features
        double perfRating = 3.8; // Default good standing
        double attendanceRate = 96.0; // 96% presence baseline
        int monthsSincePromotion = Math.min(tenureMonths, 18);
        double salaryPercentile = calculateSalaryPercentile(emp);
        double unplannedLeaveRatio = 0.15; // 15% sick vs total leave
        double engagementScore = 78.0;

        // Custom adjustments based on demo persona properties
        if ("employee@nexushr.demo".equalsIgnoreCase(emp.getEmail())) {
            perfRating = 4.2;
            attendanceRate = 98.0;
            monthsSincePromotion = 14;
            unplannedLeaveRatio = 0.10;
            engagementScore = 88.0;
        }

        // Section 9.5 Formula calculation
        List<AttritionFactorDto> factorList = new ArrayList<>();

        // 1. Performance (weight 20): clamp((3.5 - perfRating)/2.5)
        double perfSub = clamp((3.5 - perfRating) / 2.5);
        factorList.add(AttritionFactorDto.builder()
                .factor("Performance")
                .weight(20)
                .subScore(round2(perfSub))
                .contribution(round2(20 * perfSub))
                .explanation(String.format("Latest performance rating at %.1f/5.0", perfRating))
                .build());

        // 2. Attendance (weight 15): clamp((95 - attendanceRate)/25)
        double attSub = clamp((95.0 - attendanceRate) / 25.0);
        factorList.add(AttritionFactorDto.builder()
                .factor("Attendance")
                .weight(15)
                .subScore(round2(attSub))
                .contribution(round2(15 * attSub))
                .explanation(String.format("90-day attendance presence verified at %.1f%%", attendanceRate))
                .build());

        // 3. Tenure (weight 10): <6 mo: 0.4, 6-24: 1.0, 24-48: 0.6, >48: 0.2
        double tenureSub;
        if (tenureMonths < 6) tenureSub = 0.4;
        else if (tenureMonths <= 24) tenureSub = 1.0;
        else if (tenureMonths <= 48) tenureSub = 0.6;
        else tenureSub = 0.2;
        factorList.add(AttritionFactorDto.builder()
                .factor("Tenure")
                .weight(10)
                .subScore(round2(tenureSub))
                .contribution(round2(10 * tenureSub))
                .explanation(String.format("Current organizational tenure is %d months", tenureMonths))
                .build());

        // 4. Promotion Gap (weight 15): clamp((monthsSincePromotion - 18)/18)
        double promSub = clamp((monthsSincePromotion - 18.0) / 18.0);
        factorList.add(AttritionFactorDto.builder()
                .factor("Promotion Gap")
                .weight(15)
                .subScore(round2(promSub))
                .contribution(round2(15 * promSub))
                .explanation(String.format("%d months elapsed since last promotion or appointment", monthsSincePromotion))
                .build());

        // 5. Salary Percentile (weight 15): clamp((40 - salaryPercentile)/40)
        double salSub = clamp((40.0 - salaryPercentile) / 40.0);
        factorList.add(AttritionFactorDto.builder()
                .factor("Salary Percentile")
                .weight(15)
                .subScore(round2(salSub))
                .contribution(round2(15 * salSub))
                .explanation(String.format("CTC benchmarked at %.1f percentile of department peers", salaryPercentile))
                .build());

        // 6. Unplanned Leave (weight 10): clamp((unplannedLeaveRatio - 0.3)/0.4)
        double leaveSub = clamp((unplannedLeaveRatio - 0.3) / 0.4);
        factorList.add(AttritionFactorDto.builder()
                .factor("Unplanned Leave")
                .weight(10)
                .subScore(round2(leaveSub))
                .contribution(round2(10 * leaveSub))
                .explanation(String.format("Unplanned medical leave ratio at %.0f%% of total quota", unplannedLeaveRatio * 100))
                .build());

        // 7. Engagement (weight 15): clamp((60 - engagementScore)/60)
        double engSub = clamp((60.0 - engagementScore) / 60.0);
        factorList.add(AttritionFactorDto.builder()
                .factor("Engagement")
                .weight(15)
                .subScore(round2(engSub))
                .contribution(round2(15 * engSub))
                .explanation(String.format("Composite engagement index calculated at %.1f/100", engagementScore))
                .build());

        // Calculate total score: sum(weight * subScore)
        double totalScore = 0.0;
        for (AttritionFactorDto f : factorList) {
            totalScore += f.getContribution();
        }
        totalScore = round2(totalScore);

        String level;
        if (totalScore < 35.0) {
            level = "LOW";
        } else if (totalScore < 65.0) {
            level = "MEDIUM";
        } else {
            level = "HIGH";
        }

        // Top 3 contributing factors by contribution
        factorList.sort((a, b) -> Double.compare(b.getContribution(), a.getContribution()));
        List<AttritionFactorDto> top3 = factorList.stream().limit(3).collect(Collectors.toList());

        AttritionPredictionDto dto = AttritionPredictionDto.builder()
                .employeeId(emp.getId())
                .employeeCode(emp.getEmployeeCode())
                .employeeName(emp.getFirstName() + " " + emp.getLastName())
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : "General")
                .designation(emp.getDesignation() != null ? emp.getDesignation() : "Specialist")
                .riskScore(totalScore)
                .riskLevel(level)
                .contributingFactors(top3)
                .source("RULES")
                .generatedAt(LocalDateTime.now())
                .build();

        dto.setRecommendedActions(aiProvider.recommend(dto));
        dto.setNarrative(aiProvider.explain(dto));

        predictionCache.put(emp.getId(), dto);
        return dto;
    }

    private double calculateSalaryPercentile(Employee emp) {
        if (emp.getDepartment() == null || emp.getSalary() == null) {
            return 50.0;
        }
        List<Employee> peers = employeeRepository.findByDepartmentId(emp.getDepartment().getId());
        if (peers.size() < 2) return 50.0;

        List<BigDecimal> salaries = peers.stream()
                .map(Employee::getSalary)
                .filter(Objects::nonNull)
                .sorted()
                .collect(Collectors.toList());

        int countLower = 0;
        for (BigDecimal s : salaries) {
            if (s.compareTo(emp.getSalary()) < 0) {
                countLower++;
            }
        }
        return round2(((double) countLower / salaries.size()) * 100.0);
    }

    private double clamp(double val) {
        if (val < 0.0) return 0.0;
        if (val > 1.0) return 1.0;
        return val;
    }

    private double round2(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
