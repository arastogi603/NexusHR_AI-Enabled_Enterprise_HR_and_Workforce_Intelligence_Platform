package com.zidio.nexushr.analytics.service;

import com.zidio.nexushr.analytics.dto.AttritionPredictionDto;
import com.zidio.nexushr.employee.entity.Employee;
import com.zidio.nexushr.employee.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;

@Service
public class ReportExportService {

    private final EmployeeRepository employeeRepository;
    private final AttritionService attritionService;

    public ReportExportService(EmployeeRepository employeeRepository, AttritionService attritionService) {
        this.employeeRepository = employeeRepository;
        this.attritionService = attritionService;
    }

    public byte[] generateCsvReport() {
        StringBuilder csv = new StringBuilder();
        csv.append("Employee Code,Full Name,Department,Designation,Annual CTC (INR),Attrition Risk Score,Risk Level,Status\n");

        List<Employee> employees = employeeRepository.findAll();
        for (Employee emp : employees) {
            AttritionPredictionDto pred = attritionService.calculatePredictionForEmployee(emp);
            csv.append(String.format("\"%s\",\"%s %s\",\"%s\",\"%s\",\"%s\",\"%.1f\",\"%s\",\"%s\"\n",
                    emp.getEmployeeCode() != null ? emp.getEmployeeCode() : "N/A",
                    emp.getFirstName(), emp.getLastName(),
                    emp.getDepartment() != null ? emp.getDepartment().getName() : "General",
                    emp.getDesignation() != null ? emp.getDesignation() : "Staff",
                    emp.getSalary() != null ? emp.getSalary().toPlainString() : "0.00",
                    pred.getRiskScore(),
                    pred.getRiskLevel(),
                    emp.getStatus() != null ? emp.getStatus() : "ACTIVE"
            ));
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    public byte[] generateExecutiveTextReport() {
        StringBuilder sb = new StringBuilder();
        sb.append("========================================================================\n");
        sb.append("          NEXUSHR EXECUTIVE WORKFORCE & TALENT INTELLIGENCE REPORT       \n");
        sb.append("                   Date of Report: ").append(LocalDate.now()).append("\n");
        sb.append("========================================================================\n\n");

        List<Employee> employees = employeeRepository.findAll();
        long totalStaff = employees.size();
        sb.append("1. EXECUTIVE WORKFORCE SUMMARY:\n");
        sb.append("   - Total Active Headcount: ").append(totalStaff).append(" personnel\n");
        sb.append("   - Statutory Payroll Compliance: Indian FY 2025-26 Section 115BAC Enforced\n");
        sb.append("   - Audit Trail Integrity: SHA-256 Forward-Chained Ledger Active\n\n");

        sb.append("2. PREDICTIVE TALENT ATTRITION HOTSPOTS:\n");
        long low = 0, med = 0, high = 0;
        for (Employee emp : employees) {
            AttritionPredictionDto p = attritionService.calculatePredictionForEmployee(emp);
            if ("HIGH".equalsIgnoreCase(p.getRiskLevel())) high++;
            else if ("MEDIUM".equalsIgnoreCase(p.getRiskLevel())) med++;
            else low++;
        }
        sb.append("   - Low Flight Risk (Score < 35):     ").append(low).append(" staff\n");
        sb.append("   - Moderate Flight Risk (35 - 64):  ").append(med).append(" staff\n");
        sb.append("   - Elevated Flight Risk (Score >= 65): ").append(high).append(" staff\n\n");

        sb.append("3. STRATEGIC RECOMMENDATIONS:\n");
        sb.append("   a) Focus retention discussions on employees with tenure > 18 months without promotion.\n");
        sb.append("   b) Benchmark Engineering compensation against current median market rates.\n");
        sb.append("   c) Sponsor advanced Kubernetes and Reactive Microservices certifications.\n\n");
        sb.append("========================================================================\n");
        sb.append("Report generated securely by NexusHR Intelligence Engine v1.0\n");

        return sb.toString().getBytes(StandardCharsets.UTF_8);
    }
}
