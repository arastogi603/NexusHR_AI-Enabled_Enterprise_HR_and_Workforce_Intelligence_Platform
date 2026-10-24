package com.zidio.nexushr.employee.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Data
public class OnboardingRequest {
    // Step 1: Personal Information
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    private String email;

    private String phone;
    private LocalDate dateOfBirth;
    private String emergencyContact;

    // Step 2: Job Details
    private String employeeCode;
    private String designation;
    private UUID departmentId;
    private UUID managerId;

    @NotNull(message = "Hire date is required")
    private LocalDate hireDate = LocalDate.now();

    private String workLocation = "Mumbai Tech Hub";

    // Step 3: Compensation & Benefits
    @NotNull(message = "Annual Salary/CTC is required")
    private BigDecimal salary;
    private BigDecimal basicSalary;
    private BigDecimal hra;
    private BigDecimal specialAllowance;

    // Step 4: System Access & Provisioning
    private String initialPassword;
    private boolean sendWelcomeEmail = true;

    // Step 5: Verification & Checklist
    private boolean documentsVerified = true;
    private boolean taxDeclarationSubmitted = true;
    private boolean bankDetailsSubmitted = true;
    private boolean complianceAcknowledged = true;
    private Map<String, Object> extraMetadata;
}
