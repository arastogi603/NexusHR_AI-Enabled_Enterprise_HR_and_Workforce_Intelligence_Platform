package com.zidio.nexushr.employee.service;

import com.zidio.nexushr.common.exception.BusinessRuleException;
import com.zidio.nexushr.common.exception.DuplicateResourceException;
import com.zidio.nexushr.common.exception.ResourceNotFoundException;
import com.zidio.nexushr.employee.dto.EmployeeDto;
import com.zidio.nexushr.employee.dto.EmployeeRequest;
import com.zidio.nexushr.employee.dto.OffboardingRequest;
import com.zidio.nexushr.employee.dto.OnboardingRequest;
import com.zidio.nexushr.employee.entity.Department;
import com.zidio.nexushr.employee.entity.Employee;
import com.zidio.nexushr.employee.entity.EmployeeHistory;
import com.zidio.nexushr.employee.entity.LeaveBalance;
import com.zidio.nexushr.employee.mapper.EmployeeMapper;
import com.zidio.nexushr.employee.repository.DepartmentRepository;
import com.zidio.nexushr.employee.repository.EmployeeHistoryRepository;
import com.zidio.nexushr.employee.repository.EmployeeRepository;
import com.zidio.nexushr.employee.repository.LeaveBalanceRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeHistoryRepository employeeHistoryRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeMapper employeeMapper;

    @Autowired(required = false)
    private PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           EmployeeHistoryRepository employeeHistoryRepository,
                           LeaveBalanceRepository leaveBalanceRepository,
                           EmployeeMapper employeeMapper) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.employeeHistoryRepository = employeeHistoryRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeMapper = employeeMapper;
    }

    public Page<EmployeeDto> getAllEmployees(UUID departmentId, String status, Pageable pageable) {
        Page<Employee> employees;
        
        if (departmentId != null && status != null) {
            employees = employeeRepository.findByDepartmentIdAndStatus(departmentId, status, pageable);
        } else if (status != null) {
            employees = employeeRepository.findByStatus(status, pageable);
        } else {
            employees = employeeRepository.findAll(pageable);
        }
        
        return employees.map(employeeMapper::toDto);
    }

    public EmployeeDto getEmployeeById(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return employeeMapper.toDto(employee);
    }

    @Transactional
    public EmployeeDto createEmployee(EmployeeRequest request) {
        if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Employee with email '" + request.getEmail() + "' already exists");
        }

        if (request.getManagerId() != null) {
            validateManagerAssignment(null, request.getManagerId());
        }

        Employee employee = new Employee();
        
        // Link to existing user or create record in users table
        List<?> userIds = entityManager.createNativeQuery("SELECT id FROM users WHERE email = :email")
                .setParameter("email", request.getEmail())
                .getResultList();

        UUID userId;
        String provisionalPassword = "Demo@" + (1000 + new Random().nextInt(9000));
        String encodedPwd = passwordEncoder != null ? passwordEncoder.encode(provisionalPassword) :
                "$argon2id$v=19$m=16384,t=2,p=1$dummy$dummy";

        if (!userIds.isEmpty()) {
            userId = (UUID) userIds.get(0);
        } else {
            userId = UUID.randomUUID();
            entityManager.createNativeQuery("INSERT INTO users (id, email, password_hash, is_active, must_change_password, failed_attempts, created_at, updated_at) " +
                    "VALUES (:id, :email, :pwd, true, true, 0, NOW(), NOW())")
                    .setParameter("id", userId)
                    .setParameter("email", request.getEmail())
                    .setParameter("pwd", encodedPwd)
                    .executeUpdate();

            // Link ROLE_EMPLOYEE
            List<?> roleIds = entityManager.createNativeQuery("SELECT id FROM roles WHERE name = 'ROLE_EMPLOYEE'").getResultList();
            if (!roleIds.isEmpty()) {
                entityManager.createNativeQuery("INSERT INTO user_roles (user_id, role_id) VALUES (:uid, :rid) ON CONFLICT DO NOTHING")
                        .setParameter("uid", userId)
                        .setParameter("rid", roleIds.get(0))
                        .executeUpdate();
            }
        }
        employee.setUserId(userId); 
        
        employee.setEmployeeCode("EMP-" + (1000 + new Random().nextInt(9000)));
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDesignation(request.getDesignation());
        employee.setHireDate(request.getHireDate() != null ? request.getHireDate() : LocalDate.now());
        employee.setSalary(request.getSalary());
        employee.setStatus("ACTIVE");

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            employee.setDepartment(dept);
        }

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            employee.setManager(manager);
        }

        employee = employeeRepository.save(employee);

        // Initialize default leave balance for current year
        initLeaveBalances(employee);

        EmployeeDto dto = employeeMapper.toDto(employee);
        dto.setProvisionalPassword(provisionalPassword);
        return dto;
    }

    @Transactional
    public EmployeeDto onboardEmployee(OnboardingRequest request) {
        if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Employee with email '" + request.getEmail() + "' already exists");
        }

        if (request.getManagerId() != null) {
            validateManagerAssignment(null, request.getManagerId());
        }

        Employee employee = new Employee();

        // 1. Provision user credentials with forced password change
        String rawPassword = (request.getInitialPassword() != null && !request.getInitialPassword().isBlank()) ?
                request.getInitialPassword() : "Welcome@" + (2026 + new Random().nextInt(100)) + "!";
        String encodedPassword = passwordEncoder != null ? passwordEncoder.encode(rawPassword) :
                "$argon2id$v=19$m=16384,t=2,p=1$dummy$dummy";

        List<?> existingUsers = entityManager.createNativeQuery("SELECT id FROM users WHERE email = :email")
                .setParameter("email", request.getEmail())
                .getResultList();

        UUID userId;
        if (!existingUsers.isEmpty()) {
            userId = (UUID) existingUsers.get(0);
        } else {
            userId = UUID.randomUUID();
            entityManager.createNativeQuery("INSERT INTO users (id, email, password_hash, is_active, must_change_password, failed_attempts, created_at, updated_at) " +
                    "VALUES (:id, :email, :pwd, true, true, 0, NOW(), NOW())")
                    .setParameter("id", userId)
                    .setParameter("email", request.getEmail())
                    .setParameter("pwd", encodedPassword)
                    .executeUpdate();

            // Grant ROLE_EMPLOYEE
            List<?> roleIds = entityManager.createNativeQuery("SELECT id FROM roles WHERE name = 'ROLE_EMPLOYEE'").getResultList();
            if (!roleIds.isEmpty()) {
                entityManager.createNativeQuery("INSERT INTO user_roles (user_id, role_id) VALUES (:uid, :rid) ON CONFLICT DO NOTHING")
                        .setParameter("uid", userId)
                        .setParameter("rid", roleIds.get(0))
                        .executeUpdate();
            }
        }
        employee.setUserId(userId);

        // 2. Set employee details
        String empCode = (request.getEmployeeCode() != null && !request.getEmployeeCode().isBlank()) ?
                request.getEmployeeCode() : "EMP-" + (1000 + new Random().nextInt(9000));
        employee.setEmployeeCode(empCode);
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setEmail(request.getEmail());
        employee.setPhone(request.getPhone());
        employee.setDesignation(request.getDesignation());
        employee.setHireDate(request.getHireDate() != null ? request.getHireDate() : LocalDate.now());
        employee.setSalary(request.getSalary());
        employee.setStatus("ACTIVE");

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
            employee.setDepartment(dept);
        }

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found with id: " + request.getManagerId()));
            employee.setManager(manager);
        }

        // Store metadata JSON with checklist and contact info
        String metadataJson = String.format(
                "{\"emergencyContact\":\"%s\",\"dateOfBirth\":\"%s\",\"workLocation\":\"%s\"," +
                "\"documentsVerified\":%b,\"taxDeclarationSubmitted\":%b,\"bankDetailsSubmitted\":%b,\"complianceAcknowledged\":%b}",
                escapeJson(request.getEmergencyContact()),
                request.getDateOfBirth() != null ? request.getDateOfBirth().toString() : "",
                escapeJson(request.getWorkLocation()),
                request.isDocumentsVerified(),
                request.isTaxDeclarationSubmitted(),
                request.isBankDetailsSubmitted(),
                request.isComplianceAcknowledged()
        );
        employee.setMetadata(metadataJson);

        employee = employeeRepository.save(employee);

        // 3. Initialize annual leave balance
        initLeaveBalances(employee);

        // 4. Record in EmployeeHistory
        EmployeeHistory history = new EmployeeHistory();
        history.setEmployee(employee);
        history.setChangeType("ONBOARDED");
        history.setEffectiveDate(employee.getHireDate());
        history.setNewValue(String.format("{\"designation\":\"%s\",\"salary\":\"%s\",\"department\":\"%s\"}",
                escapeJson(employee.getDesignation()),
                employee.getSalary(),
                employee.getDepartment() != null ? employee.getDepartment().getName() : "None"));
        history.setRemarks("Onboarded via 5-step lifecycle wizard with provisional password");
        employeeHistoryRepository.save(history);

        EmployeeDto dto = employeeMapper.toDto(employee);
        dto.setProvisionalPassword(rawPassword);
        dto.setMetadata(metadataJson);
        return dto;
    }

    @Transactional
    public EmployeeDto offboardEmployee(UUID id, OffboardingRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employee.setStatus("OFFBOARDED");
        employee.setDeletedAt(LocalDateTime.now());

        String exitMetadata = String.format(
                "{\"exitDate\":\"%s\",\"reason\":\"%s\",\"hardwareReturned\":%b," +
                "\"companyAssetsCleared\":%b,\"systemAccessRevoked\":%b,\"exitInterviewCompleted\":%b,\"remarks\":\"%s\"}",
                request.getExitDate(),
                escapeJson(request.getReason()),
                request.isHardwareReturned(),
                request.isCompanyAssetsCleared(),
                request.isSystemAccessRevoked(),
                request.isExitInterviewCompleted(),
                escapeJson(request.getRemarks())
        );
        employee.setMetadata(exitMetadata);
        employee = employeeRepository.save(employee);

        // Disable user login and revoke refresh tokens
        entityManager.createNativeQuery("UPDATE users SET is_active = false, updated_at = NOW() WHERE id = :uid")
                .setParameter("uid", employee.getUserId())
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = :uid")
                .setParameter("uid", employee.getUserId())
                .executeUpdate();

        // Record offboarding in EmployeeHistory
        EmployeeHistory history = new EmployeeHistory();
        history.setEmployee(employee);
        history.setChangeType("OFFBOARDED");
        history.setEffectiveDate(request.getExitDate());
        history.setNewValue(exitMetadata);
        history.setRemarks("Offboarding completed: " + request.getReason());
        employeeHistoryRepository.save(history);

        EmployeeDto dto = employeeMapper.toDto(employee);
        dto.setMetadata(exitMetadata);
        return dto;
    }

    public List<EmployeeHistory> getEmployeeHistory(UUID employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found with id: " + employeeId);
        }
        return employeeHistoryRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    @Transactional
    public EmployeeDto updateEmployee(UUID id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        if (request.getManagerId() != null) {
            validateManagerAssignment(id, request.getManagerId());
        }

        String prevDesignation = employee.getDesignation();
        java.math.BigDecimal prevSalary = employee.getSalary();
        UUID prevDeptId = employee.getDepartment() != null ? employee.getDepartment().getId() : null;

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setPhone(request.getPhone());
        employee.setDesignation(request.getDesignation());
        employee.setSalary(request.getSalary());

        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            employee.setDepartment(dept);
        } else {
            employee.setDepartment(null);
        }

        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            employee.setManager(manager);
        } else {
            employee.setManager(null);
        }

        employee = employeeRepository.save(employee);

        // Record history if key profile fields changed
        boolean compensationChanged = (request.getSalary() != null && !request.getSalary().equals(prevSalary));
        boolean designationChanged = (request.getDesignation() != null && !request.getDesignation().equals(prevDesignation));
        boolean departmentChanged = (request.getDepartmentId() != null && !request.getDepartmentId().equals(prevDeptId));

        if (compensationChanged || designationChanged || departmentChanged) {
            EmployeeHistory history = new EmployeeHistory();
            history.setEmployee(employee);
            history.setChangeType(compensationChanged ? "COMPENSATION_REVISION" :
                    departmentChanged ? "DEPARTMENT_TRANSFER" : "PROMOTION");
            history.setEffectiveDate(LocalDate.now());
            history.setPreviousValue(String.format("{\"designation\":\"%s\",\"salary\":\"%s\"}", prevDesignation, prevSalary));
            history.setNewValue(String.format("{\"designation\":\"%s\",\"salary\":\"%s\"}", employee.getDesignation(), employee.getSalary()));
            history.setRemarks("Employee profile updated");
            employeeHistoryRepository.save(history);
        }

        return employeeMapper.toDto(employee);
    }

    @Transactional
    public void deleteEmployee(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        
        // Soft delete
        employee.setStatus("INACTIVE");
        employee.setDeletedAt(LocalDateTime.now());
        employeeRepository.save(employee);

        // Deactivate associated user
        entityManager.createNativeQuery("UPDATE users SET is_active = false, updated_at = NOW() WHERE id = :uid")
                .setParameter("uid", employee.getUserId())
                .executeUpdate();
    }

    private void validateManagerAssignment(UUID employeeId, UUID managerId) {
        if (managerId == null) return;
        if (employeeId != null && employeeId.equals(managerId)) {
            throw new BusinessRuleException("An employee cannot be assigned as their own manager.");
        }

        // Cycle detection: walk manager chain upwards
        UUID current = managerId;
        int depth = 0;
        while (current != null && depth < 25) {
            if (employeeId != null && current.equals(employeeId)) {
                throw new BusinessRuleException("Manager cycle detected: The selected manager already reports up to this employee.");
            }
            Optional<Employee> mgr = employeeRepository.findById(current);
            if (mgr.isEmpty() || mgr.get().getManager() == null) {
                break;
            }
            current = mgr.get().getManager().getId();
            depth++;
        }
    }

    private void initLeaveBalances(Employee employee) {
        int currentYear = LocalDate.now().getYear();
        Optional<LeaveBalance> existing = leaveBalanceRepository.findByEmployeeIdAndYear(employee.getId(), currentYear);
        if (existing.isEmpty()) {
            LeaveBalance balance = new LeaveBalance();
            balance.setEmployee(employee);
            balance.setYear(currentYear);
            balance.setCasualLeave(12);
            balance.setEarnedLeave(15);
            balance.setSickLeave(10);
            balance.setMaternityLeave(0);
            leaveBalanceRepository.save(balance);
        }
    }

    private String escapeJson(String input) {
        if (input == null) return "";
        return input.replace("\"", "\\\"").replace("\n", " ").replace("\r", "");
    }

    public List<com.zidio.nexushr.employee.dto.OrgNodeDto> getOrgChart() {
        List<Employee> allEmployees = employeeRepository.findAll();
        Map<UUID, com.zidio.nexushr.employee.dto.OrgNodeDto> nodeMap = new HashMap<>();

        for (Employee emp : allEmployees) {
            String initial = (emp.getFirstName() != null && !emp.getFirstName().isEmpty() ? emp.getFirstName().substring(0, 1) : "") +
                             (emp.getLastName() != null && !emp.getLastName().isEmpty() ? emp.getLastName().substring(0, 1) : "");
            com.zidio.nexushr.employee.dto.OrgNodeDto node = com.zidio.nexushr.employee.dto.OrgNodeDto.builder()
                    .id(emp.getId())
                    .employeeCode(emp.getEmployeeCode())
                    .name(emp.getFirstName() + " " + emp.getLastName())
                    .designation(emp.getDesignation() != null ? emp.getDesignation() : "Specialist")
                    .department(emp.getDepartment() != null ? emp.getDepartment().getName() : "General")
                    .email(emp.getEmail())
                    .avatar(initial.toUpperCase())
                    .managerId(emp.getManager() != null ? emp.getManager().getId() : null)
                    .children(new ArrayList<>())
                    .build();
            nodeMap.put(emp.getId(), node);
        }

        List<com.zidio.nexushr.employee.dto.OrgNodeDto> rootNodes = new ArrayList<>();
        Set<UUID> visited = new HashSet<>();

        for (com.zidio.nexushr.employee.dto.OrgNodeDto node : nodeMap.values()) {
            if (node.getManagerId() == null || !nodeMap.containsKey(node.getManagerId()) || node.getManagerId().equals(node.getId())) {
                rootNodes.add(node);
            } else {
                com.zidio.nexushr.employee.dto.OrgNodeDto parent = nodeMap.get(node.getManagerId());
                if (!hasCycle(node.getId(), parent.getId(), nodeMap, new HashSet<>())) {
                    parent.getChildren().add(node);
                } else {
                    rootNodes.add(node);
                }
            }
        }

        // If no root nodes identified (e.g. all have invalid refs), return all as roots
        if (rootNodes.isEmpty() && !nodeMap.isEmpty()) {
            rootNodes.addAll(nodeMap.values());
        }

        return rootNodes;
    }

    private boolean hasCycle(UUID target, UUID current, Map<UUID, com.zidio.nexushr.employee.dto.OrgNodeDto> map, Set<UUID> seen) {
        if (target.equals(current)) return true;
        if (!seen.add(current)) return true;
        com.zidio.nexushr.employee.dto.OrgNodeDto node = map.get(current);
        if (node != null && node.getManagerId() != null && map.containsKey(node.getManagerId())) {
            return hasCycle(target, node.getManagerId(), map, seen);
        }
        return false;
    }
}

