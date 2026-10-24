package com.zidio.nexushr.employee.controller;

import com.zidio.nexushr.employee.dto.EmployeeDto;
import com.zidio.nexushr.employee.dto.EmployeeRequest;
import com.zidio.nexushr.employee.dto.OffboardingRequest;
import com.zidio.nexushr.employee.dto.OnboardingRequest;
import com.zidio.nexushr.employee.entity.EmployeeHistory;
import com.zidio.nexushr.employee.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Page<EmployeeDto>> getAllEmployees(
            @RequestParam(required = false) UUID departmentId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(employeeService.getAllEmployees(departmentId, status, PageRequest.of(page, size)));
    }

    @GetMapping("/org-chart")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE', 'EXECUTIVE')")
    public ResponseEntity<List<com.zidio.nexushr.employee.dto.OrgNodeDto>> getOrgChart() {
        return ResponseEntity.ok(employeeService.getOrgChart());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeDto> createEmployee(@Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.createEmployee(request));
    }

    @PostMapping("/onboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeDto> onboardEmployee(@Valid @RequestBody OnboardingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeService.onboardEmployee(request));
    }

    @PostMapping("/{id}/offboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeDto> offboardEmployee(@PathVariable UUID id, @Valid @RequestBody OffboardingRequest request) {
        return ResponseEntity.ok(employeeService.offboardEmployee(id, request));
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<EmployeeHistory>> getEmployeeHistory(@PathVariable UUID id) {
        return ResponseEntity.ok(employeeService.getEmployeeHistory(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeDto> updateEmployee(@PathVariable UUID id, @Valid @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable UUID id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}
