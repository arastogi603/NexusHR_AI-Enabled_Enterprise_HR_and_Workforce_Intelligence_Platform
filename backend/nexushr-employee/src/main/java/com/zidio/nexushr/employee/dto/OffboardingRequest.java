package com.zidio.nexushr.employee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class OffboardingRequest {
    @NotNull(message = "Exit date is required")
    private LocalDate exitDate = LocalDate.now();

    @NotBlank(message = "Exit reason is required")
    private String reason; // Resignation, Termination, Retirement, End of Contract

    private boolean hardwareReturned = true;
    private boolean companyAssetsCleared = true;
    private boolean systemAccessRevoked = true;
    private boolean exitInterviewCompleted = true;
    private String remarks;
}
