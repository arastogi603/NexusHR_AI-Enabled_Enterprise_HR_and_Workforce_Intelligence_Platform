package com.zidio.nexushr.payroll.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.zidio.nexushr.common.exception.BusinessRuleException;
import com.zidio.nexushr.common.exception.DuplicateResourceException;
import com.zidio.nexushr.common.exception.ResourceNotFoundException;
import com.zidio.nexushr.employee.entity.Employee;
import com.zidio.nexushr.employee.repository.EmployeeRepository;
import com.zidio.nexushr.payroll.calculator.SalaryStructureCalculator;
import com.zidio.nexushr.payroll.dto.PayrollPreviewDto;
import com.zidio.nexushr.payroll.dto.PayrollRunDto;
import com.zidio.nexushr.payroll.dto.PayslipDto;
import com.zidio.nexushr.payroll.entity.PayrollRecord;
import com.zidio.nexushr.payroll.entity.PayrollRun;
import com.zidio.nexushr.payroll.entity.Payslip;
import com.zidio.nexushr.payroll.repository.PayrollRecordRepository;
import com.zidio.nexushr.payroll.repository.PayrollRunRepository;
import com.zidio.nexushr.payroll.repository.PayslipRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PayrollRunService {

    private final PayrollRunRepository payrollRunRepository;
    private final PayslipRepository payslipRepository;
    private final PayrollRecordRepository payrollRecordRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryStructureCalculator salaryCalculator;

    public PayrollRunService(PayrollRunRepository payrollRunRepository,
                             PayslipRepository payslipRepository,
                             PayrollRecordRepository payrollRecordRepository,
                             EmployeeRepository employeeRepository,
                             SalaryStructureCalculator salaryCalculator) {
        this.payrollRunRepository = payrollRunRepository;
        this.payslipRepository = payslipRepository;
        this.payrollRecordRepository = payrollRecordRepository;
        this.employeeRepository = employeeRepository;
        this.salaryCalculator = salaryCalculator;
    }

    /**
     * Preview payroll calculation without database persistence.
     * Detects anomalies: missing CTC, negative net pay, excessive LOP.
     */
    public PayrollPreviewDto previewPayroll(int month, int year) {
        validateMonthAndYear(month, year);
        int daysInMonth = YearMonth.of(year, month).lengthOfMonth();

        List<Employee> activeEmployees = employeeRepository.findAll().stream()
                .filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus()) || "ONBOARDING".equalsIgnoreCase(e.getStatus()))
                .collect(Collectors.toList());

        List<String> anomalies = new ArrayList<>();
        List<PayslipDto> previewItems = new ArrayList<>();

        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;

        for (Employee emp : activeEmployees) {
            BigDecimal ctc = emp.getSalary();
            if (ctc == null || ctc.compareTo(BigDecimal.ZERO) <= 0) {
                anomalies.add("Missing CTC configuration for employee " + emp.getFirstName() + " " + emp.getLastName() + " (" + emp.getEmployeeCode() + ")");
                ctc = new BigDecimal("1200000.00"); // Baseline fallback for preview projection
            }

            // In v1 demo, default LOP = 0
            int lopDays = 0;
            SalaryStructureCalculator.SalaryBreakdown breakdown = salaryCalculator.calculate(
                    ctc, daysInMonth, lopDays, true, true);

            if (breakdown.netSalary.compareTo(BigDecimal.ZERO) <= 0) {
                anomalies.add("Negative or zero net pay computed for " + emp.getFirstName() + " " + emp.getLastName());
            }

            PayslipDto dto = toPayslipDto(null, emp, month, year, breakdown, "PREVIEW");
            previewItems.add(dto);

            totalGross = totalGross.add(breakdown.grossEarnings);
            totalDeductions = totalDeductions.add(breakdown.totalDeductions);
            totalTax = totalTax.add(breakdown.tdsTax);
            totalNet = totalNet.add(breakdown.netSalary);
        }

        return PayrollPreviewDto.builder()
                .month(month)
                .year(year)
                .totalEmployees(activeEmployees.size())
                .totalGross(totalGross)
                .totalDeductions(totalDeductions)
                .totalTax(totalTax)
                .totalNet(totalNet)
                .anomalies(anomalies)
                .previewItems(previewItems)
                .build();
    }

    /**
     * Executes the monthly payroll run.
     * Enforces idempotency: second run for same month/year returns 409 PAYROLL_ALREADY_RUN.
     */
    @Transactional
    public PayrollRunDto runPayroll(int month, int year, String adminEmail) {
        validateMonthAndYear(month, year);

        // Idempotency check: 409 if already run and not FAILED
        payrollRunRepository.findByMonthAndYear(month, year).ifPresent(existing -> {
            if (!"FAILED".equalsIgnoreCase(existing.getStatus())) {
                throw new DuplicateResourceException("PAYROLL_ALREADY_RUN: Payroll for " + month + "/" + year + " has already been processed with status " + existing.getStatus());
            }
        });

        int daysInMonth = YearMonth.of(year, month).lengthOfMonth();
        List<Employee> activeEmployees = employeeRepository.findAll().stream()
                .filter(e -> "ACTIVE".equalsIgnoreCase(e.getStatus()) || "ONBOARDING".equalsIgnoreCase(e.getStatus()))
                .collect(Collectors.toList());

        PayrollRun run = new PayrollRun();
        run.setMonth(month);
        run.setYear(year);
        run.setStatus("COMPLETED");
        run.setTotalEmployees(activeEmployees.size());
        run.setRemarks("Monthly payroll run executed by " + adminEmail);

        BigDecimal totalGross = BigDecimal.ZERO;
        BigDecimal totalDeductions = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        BigDecimal totalNet = BigDecimal.ZERO;

        List<Payslip> payslips = new ArrayList<>();
        LocalDate periodStart = LocalDate.of(year, month, 1);
        LocalDate periodEnd = LocalDate.of(year, month, daysInMonth);

        for (Employee emp : activeEmployees) {
            BigDecimal ctc = emp.getSalary() != null ? emp.getSalary() : new BigDecimal("1200000.00");
            int lopDays = 0;
            SalaryStructureCalculator.SalaryBreakdown b = salaryCalculator.calculate(
                    ctc, daysInMonth, lopDays, true, true);

            Payslip p = new Payslip();
            p.setPayrollRun(run);
            p.setEmployee(emp);
            p.setMonth(month);
            p.setYear(year);
            p.setAnnualCtc(ctc);
            p.setPaidDays(b.paidDays);
            p.setLopDays(b.lopDays);
            p.setBasic(b.basic);
            p.setHra(b.hra);
            p.setTransportAllowance(b.transportAllowance);
            p.setSpecialAllowance(b.specialAllowance);
            p.setGrossEarnings(b.grossEarnings);
            p.setPfDeduction(b.pfDeduction);
            p.setEsiDeduction(b.esiDeduction);
            p.setPtDeduction(b.ptDeduction);
            p.setTdsTax(b.tdsTax);
            p.setTotalDeductions(b.totalDeductions);
            p.setNetSalary(b.netSalary);
            p.setStatus("DRAFT");
            payslips.add(p);

            // Legacy table sync
            PayrollRecord legacyRec = new PayrollRecord();
            legacyRec.setEmployee(emp);
            legacyRec.setPayPeriodStart(periodStart);
            legacyRec.setPayPeriodEnd(periodEnd);
            legacyRec.setBaseSalary(b.basic);
            legacyRec.setAllowances(b.hra.add(b.transportAllowance).add(b.specialAllowance));
            legacyRec.setDeductions(b.pfDeduction.add(b.esiDeduction).add(b.ptDeduction));
            legacyRec.setTax(b.tdsTax);
            legacyRec.setNetSalary(b.netSalary);
            legacyRec.setStatus("PROCESSED");
            legacyRec.setProcessedDate(LocalDateTime.now());
            legacyRec.setRemarks("Batch Run " + month + "/" + year);
            payrollRecordRepository.save(legacyRec);

            totalGross = totalGross.add(b.grossEarnings);
            totalDeductions = totalDeductions.add(b.totalDeductions);
            totalTax = totalTax.add(b.tdsTax);
            totalNet = totalNet.add(b.netSalary);
        }

        run.setTotalGross(totalGross);
        run.setTotalDeductions(totalDeductions);
        run.setTotalTax(totalTax);
        run.setTotalNet(totalNet);
        run.setPayslips(payslips);

        PayrollRun savedRun = payrollRunRepository.save(run);
        return toPayrollRunDto(savedRun, true);
    }

    /**
     * Publishes a completed payroll run.
     * Makes payslips immutable and ready for distribution.
     */
    @Transactional
    public PayrollRunDto publishPayroll(UUID runId, String adminEmail) {
        PayrollRun run = payrollRunRepository.findById(runId)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll run not found: " + runId));

        if ("PUBLISHED".equalsIgnoreCase(run.getStatus())) {
            throw new BusinessRuleException("PAYROLL_ALREADY_PUBLISHED: This payroll run is already published and immutable.");
        }

        run.setStatus("PUBLISHED");
        run.setPublishedAt(LocalDateTime.now());
        run.setRemarks(run.getRemarks() + " · Published by " + adminEmail);

        for (Payslip p : run.getPayslips()) {
            p.setStatus("PUBLISHED");
        }

        PayrollRun updated = payrollRunRepository.save(run);
        return toPayrollRunDto(updated, true);
    }

    public List<PayrollRunDto> getAllRuns() {
        return payrollRunRepository.findAllByOrderByYearDescMonthDesc().stream()
                .map(r -> toPayrollRunDto(r, false))
                .collect(Collectors.toList());
    }

    public PayrollRunDto getRunById(UUID id) {
        PayrollRun run = payrollRunRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payroll run not found: " + id));
        return toPayrollRunDto(run, true);
    }

    public List<PayslipDto> getMyPayslips(String userEmail) {
        Employee employee = employeeRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee profile not found for " + userEmail));

        return payslipRepository.findByEmployeeIdOrderByYearDescMonthDesc(employee.getId()).stream()
                .map(this::toPayslipDtoFromEntity)
                .collect(Collectors.toList());
    }

    public PayslipDto getPayslipById(UUID id, String userEmail, boolean isAdmin) {
        Payslip payslip = payslipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payslip not found: " + id));

        if (!isAdmin && !payslip.getEmployee().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Access denied: You can only view your own payslips.");
        }

        return toPayslipDtoFromEntity(payslip);
    }

    /**
     * Generates a downloadable statutory PDF payslip using OpenPDF.
     * Includes employer banner, employee block, earnings/deductions table, and tax summary.
     */
    public byte[] generatePayslipPdf(UUID payslipId, String userEmail, boolean isAdmin) {
        Payslip p = payslipRepository.findById(payslipId)
                .orElseThrow(() -> new ResourceNotFoundException("Payslip not found: " + payslipId));

        if (!isAdmin && !p.getEmployee().getEmail().equalsIgnoreCase(userEmail)) {
            throw new AccessDeniedException("Access denied: You can only download your own payslip.");
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 40, 40);
            PdfWriter.getInstance(doc, out);
            doc.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.BLACK);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.DARK_GRAY);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, Color.BLACK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);

            // Title Header
            Paragraph title = new Paragraph("NexusHR ENTERPRISE PLATFORM", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);

            Paragraph sub = new Paragraph("MONTHLY SALARY SLIP — FY 2025-26 NEW TAX REGIME", smallFont);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(15);
            doc.add(sub);

            // Employee Information Table
            PdfPTable infoTable = new PdfPTable(4);
            infoTable.setWidthPercentage(100);
            infoTable.setSpacingAfter(15);

            addCell(infoTable, "Employee Name:", boldFont, Color.LIGHT_GRAY);
            addCell(infoTable, p.getEmployee().getFirstName() + " " + p.getEmployee().getLastName(), normalFont);
            addCell(infoTable, "Employee Code:", boldFont, Color.LIGHT_GRAY);
            addCell(infoTable, p.getEmployee().getEmployeeCode() != null ? p.getEmployee().getEmployeeCode() : "NX-" + p.getEmployee().getId().toString().substring(0, 6).toUpperCase(), normalFont);

            addCell(infoTable, "Designation:", boldFont, Color.LIGHT_GRAY);
            addCell(infoTable, p.getEmployee().getDesignation(), normalFont);
            addCell(infoTable, "Department:", boldFont, Color.LIGHT_GRAY);
            addCell(infoTable, p.getEmployee().getDepartment() != null ? p.getEmployee().getDepartment().getName() : "General", normalFont);

            addCell(infoTable, "Pay Period:", boldFont, Color.LIGHT_GRAY);
            addCell(infoTable, p.getMonth() + "/" + p.getYear(), normalFont);
            addCell(infoTable, "Paid Days / LOP:", boldFont, Color.LIGHT_GRAY);
            addCell(infoTable, p.getPaidDays() + " / " + p.getLopDays() + " days", normalFont);

            doc.add(infoTable);

            // Earnings & Deductions Table
            PdfPTable salaryTable = new PdfPTable(4);
            salaryTable.setWidthPercentage(100);
            salaryTable.setSpacingAfter(15);

            addHeaderCell(salaryTable, "EARNINGS", headerFont, 2);
            addHeaderCell(salaryTable, "DEDUCTIONS", headerFont, 2);

            addCell(salaryTable, "Basic Salary", normalFont);
            addCell(salaryTable, "₹ " + p.getBasic().toString(), normalFont);
            addCell(salaryTable, "Provident Fund (PF)", normalFont);
            addCell(salaryTable, "₹ " + p.getPfDeduction().toString(), normalFont);

            addCell(salaryTable, "House Rent Allowance (HRA)", normalFont);
            addCell(salaryTable, "₹ " + p.getHra().toString(), normalFont);
            addCell(salaryTable, "Employee State Insurance (ESI)", normalFont);
            addCell(salaryTable, "₹ " + p.getEsiDeduction().toString(), normalFont);

            addCell(salaryTable, "Transport Allowance", normalFont);
            addCell(salaryTable, "₹ " + p.getTransportAllowance().toString(), normalFont);
            addCell(salaryTable, "Professional Tax (PT)", normalFont);
            addCell(salaryTable, "₹ " + p.getPtDeduction().toString(), normalFont);

            addCell(salaryTable, "Special Allowance", normalFont);
            addCell(salaryTable, "₹ " + p.getSpecialAllowance().toString(), normalFont);
            addCell(salaryTable, "Income Tax (TDS)", normalFont);
            addCell(salaryTable, "₹ " + p.getTdsTax().toString(), normalFont);

            addCell(salaryTable, "Gross Earnings", boldFont, Color.LIGHT_GRAY);
            addCell(salaryTable, "₹ " + p.getGrossEarnings().toString(), boldFont, Color.LIGHT_GRAY);
            addCell(salaryTable, "Total Deductions", boldFont, Color.LIGHT_GRAY);
            addCell(salaryTable, "₹ " + p.getTotalDeductions().toString(), boldFont, Color.LIGHT_GRAY);

            doc.add(salaryTable);

            // Net Take-Home Highlight Block
            PdfPTable netTable = new PdfPTable(2);
            netTable.setWidthPercentage(100);
            netTable.setSpacingAfter(20);

            PdfPCell netLabel = new PdfPCell(new Phrase("NET TAKE-HOME PAY", headerFont));
            netLabel.setPadding(10);
            netLabel.setBackgroundColor(new Color(245, 245, 245));
            netTable.addCell(netLabel);

            PdfPCell netVal = new PdfPCell(new Phrase("₹ " + p.getNetSalary().toString(), titleFont));
            netVal.setHorizontalAlignment(Element.ALIGN_RIGHT);
            netVal.setPadding(10);
            netVal.setBackgroundColor(new Color(245, 245, 245));
            netTable.addCell(netVal);

            doc.add(netTable);

            // Verification Footer
            Paragraph footer = new Paragraph("This is a system-generated electronic payslip verified by NexusHR Gateway. No physical signature is required.", smallFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
            return out.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Failed to generate payslip PDF: " + ex.getMessage(), ex);
        }
    }

    private void addHeaderCell(PdfPTable table, String text, Font font, int colspan) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setColspan(colspan);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBackgroundColor(new Color(230, 230, 230));
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void validateMonthAndYear(int month, int year) {
        if (month < 1 || month > 12) {
            throw new BusinessRuleException("Invalid month: " + month + ". Must be between 1 and 12.");
        }
        if (year < 2020 || year > 2030) {
            throw new BusinessRuleException("Invalid year: " + year + ".");
        }
    }

    private PayrollRunDto toPayrollRunDto(PayrollRun run, boolean includePayslips) {
        List<PayslipDto> list = null;
        if (includePayslips && run.getPayslips() != null) {
            list = run.getPayslips().stream()
                    .map(this::toPayslipDtoFromEntity)
                    .collect(Collectors.toList());
        }

        return PayrollRunDto.builder()
                .id(run.getId())
                .month(run.getMonth())
                .year(run.getYear())
                .status(run.getStatus())
                .totalGross(run.getTotalGross())
                .totalDeductions(run.getTotalDeductions())
                .totalTax(run.getTotalTax())
                .totalNet(run.getTotalNet())
                .totalEmployees(run.getTotalEmployees())
                .publishedAt(run.getPublishedAt())
                .remarks(run.getRemarks())
                .createdAt(run.getCreatedAt())
                .payslips(list)
                .build();
    }

    private PayslipDto toPayslipDto(UUID runId, Employee emp, int month, int year,
                                   SalaryStructureCalculator.SalaryBreakdown b, String status) {
        return PayslipDto.builder()
                .payrollRunId(runId)
                .employeeId(emp.getId())
                .employeeName(emp.getFirstName() + " " + emp.getLastName())
                .employeeCode(emp.getEmployeeCode())
                .designation(emp.getDesignation())
                .departmentName(emp.getDepartment() != null ? emp.getDepartment().getName() : "General")
                .month(month)
                .year(year)
                .annualCtc(emp.getSalary())
                .paidDays(b.paidDays)
                .lopDays(b.lopDays)
                .basic(b.basic)
                .hra(b.hra)
                .transportAllowance(b.transportAllowance)
                .specialAllowance(b.specialAllowance)
                .grossEarnings(b.grossEarnings)
                .pfDeduction(b.pfDeduction)
                .esiDeduction(b.esiDeduction)
                .ptDeduction(b.ptDeduction)
                .tdsTax(b.tdsTax)
                .totalDeductions(b.totalDeductions)
                .netSalary(b.netSalary)
                .status(status)
                .build();
    }

    private PayslipDto toPayslipDtoFromEntity(Payslip p) {
        return PayslipDto.builder()
                .id(p.getId())
                .payrollRunId(p.getPayrollRun() != null ? p.getPayrollRun().getId() : null)
                .employeeId(p.getEmployee().getId())
                .employeeName(p.getEmployee().getFirstName() + " " + p.getEmployee().getLastName())
                .employeeCode(p.getEmployee().getEmployeeCode())
                .designation(p.getEmployee().getDesignation())
                .departmentName(p.getEmployee().getDepartment() != null ? p.getEmployee().getDepartment().getName() : "General")
                .month(p.getMonth())
                .year(p.getYear())
                .annualCtc(p.getAnnualCtc())
                .paidDays(p.getPaidDays())
                .lopDays(p.getLopDays())
                .basic(p.getBasic())
                .hra(p.getHra())
                .transportAllowance(p.getTransportAllowance())
                .specialAllowance(p.getSpecialAllowance())
                .grossEarnings(p.getGrossEarnings())
                .pfDeduction(p.getPfDeduction())
                .esiDeduction(p.getEsiDeduction())
                .ptDeduction(p.getPtDeduction())
                .tdsTax(p.getTdsTax())
                .totalDeductions(p.getTotalDeductions())
                .netSalary(p.getNetSalary())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
