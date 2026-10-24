package com.zidio.nexushr.employee.service;

import com.zidio.nexushr.common.event.NotificationEvent;
import com.zidio.nexushr.common.exception.BusinessRuleException;
import com.zidio.nexushr.common.exception.DuplicateResourceException;
import com.zidio.nexushr.common.exception.ResourceNotFoundException;
import com.zidio.nexushr.employee.dto.LeaveDto;
import com.zidio.nexushr.employee.dto.LeaveRequest;
import com.zidio.nexushr.employee.entity.Employee;
import com.zidio.nexushr.employee.entity.Leave;
import com.zidio.nexushr.employee.entity.LeaveBalance;
import com.zidio.nexushr.employee.mapper.LeaveMapper;
import com.zidio.nexushr.employee.repository.EmployeeRepository;
import com.zidio.nexushr.employee.repository.LeaveBalanceRepository;
import com.zidio.nexushr.employee.repository.LeaveRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveMapper leaveMapper;
    private final ApplicationEventPublisher eventPublisher;

    public LeaveService(LeaveRepository leaveRepository,
                        LeaveBalanceRepository leaveBalanceRepository,
                        EmployeeRepository employeeRepository,
                        LeaveMapper leaveMapper,
                        ApplicationEventPublisher eventPublisher) {
        this.leaveRepository = leaveRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.employeeRepository = employeeRepository;
        this.leaveMapper = leaveMapper;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public LeaveDto applyForLeave(String email, LeaveRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessRuleException("End date cannot be before start date");
        }

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        // Check for overlapping leaves
        List<Leave> overlaps = leaveRepository.findOverlappingLeaves(
                employee.getId(), request.getStartDate(), request.getEndDate());
        
        if (!overlaps.isEmpty()) {
            throw new DuplicateResourceException("LEAVE_OVERLAP: A pending or approved leave request already exists for these dates");
        }

        // Calculate working days (excluding Saturday and Sunday)
        int workingDays = calculateWorkingDays(request.getStartDate(), request.getEndDate());
        if (workingDays <= 0) {
            throw new BusinessRuleException("NO_WORKING_DAYS: Selected date range does not contain any business working days");
        }

        // Pre-validate leave balance before submission
        int year = request.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndYear(employee.getId(), year)
                .orElseGet(() -> {
                    LeaveBalance defaultBal = new LeaveBalance();
                    defaultBal.setEmployee(employee);
                    defaultBal.setYear(year);
                    defaultBal.setCasualLeave(12);
                    defaultBal.setEarnedLeave(15);
                    defaultBal.setSickLeave(10);
                    return leaveBalanceRepository.save(defaultBal);
                });

        validateBalance(balance, request.getLeaveType(), workingDays);

        Leave leave = new Leave();
        leave.setEmployee(employee);
        leave.setLeaveType(request.getLeaveType().toUpperCase());
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setReason(request.getReason());
        leave.setStatus("PENDING");

        leave = leaveRepository.save(leave);

        // Notify manager if assigned
        if (employee.getManager() != null && employee.getManager().getEmail() != null) {
            try {
                eventPublisher.publishEvent(NotificationEvent.builder()
                        .recipientEmail(employee.getManager().getEmail())
                        .subject("New Leave Request: " + employee.getFirstName() + " " + employee.getLastName())
                        .message(employee.getFirstName() + " requested " + workingDays + " day(s) of " +
                                request.getLeaveType() + " from " + request.getStartDate() + " to " + request.getEndDate())
                        .sendEmail(true)
                        .build());
            } catch (Exception ignored) {}
        }

        return leaveMapper.toDto(leave);
    }

    public List<LeaveDto> getMyLeaves(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        return leaveRepository.findByEmployeeId(employee.getId()).stream()
                .map(leaveMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<LeaveDto> getPendingLeavesForManager(String managerEmail) {
        Employee manager = employeeRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        return leaveRepository.findPendingLeavesForManager(manager.getId()).stream()
                .map(leaveMapper::toDto)
                .collect(Collectors.toList());
    }

    public List<LeaveDto> getAllPendingLeaves() {
        return leaveRepository.findByStatus("PENDING").stream()
                .map(leaveMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveDto processLeaveRequest(String userEmail, UUID leaveId, boolean approve) {
        Employee approver = employeeRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Approving user not found"));

        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with id: " + leaveId));

        if (!"PENDING".equalsIgnoreCase(leave.getStatus())) {
            throw new DuplicateResourceException("Leave request is already " + leave.getStatus());
        }

        // Rule: Nobody approves own request
        if (approver.getId().equals(leave.getEmployee().getId())) {
            throw new BusinessRuleException("Self-approval prohibited: An employee cannot approve their own leave request");
        }

        leave.setApprovedBy(approver);

        if (approve) {
            leave.setStatus("APPROVED");
            deductLeaveBalance(leave);
            
            try {
                eventPublisher.publishEvent(NotificationEvent.builder()
                    .recipientEmail(leave.getEmployee().getEmail())
                    .subject("Leave Request Approved")
                    .message("Your leave request from " + leave.getStartDate() + " to " + leave.getEndDate() + " has been approved.")
                    .sendEmail(true)
                    .build());
            } catch (Exception ignored) {}
        } else {
            leave.setStatus("REJECTED");
            
            try {
                eventPublisher.publishEvent(NotificationEvent.builder()
                    .recipientEmail(leave.getEmployee().getEmail())
                    .subject("Leave Request Rejected")
                    .message("Your leave request from " + leave.getStartDate() + " to " + leave.getEndDate() + " has been rejected.")
                    .sendEmail(true)
                    .build());
            } catch (Exception ignored) {}
        }

        leave = leaveRepository.save(leave);
        return leaveMapper.toDto(leave);
    }

    private void deductLeaveBalance(Leave leave) {
        int year = leave.getStartDate().getYear();
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndYear(leave.getEmployee().getId(), year)
                .orElseGet(() -> {
                    LeaveBalance newBalance = new LeaveBalance();
                    newBalance.setEmployee(leave.getEmployee());
                    newBalance.setYear(year);
                    return leaveBalanceRepository.save(newBalance);
                });

        int days = calculateWorkingDays(leave.getStartDate(), leave.getEndDate());

        switch (leave.getLeaveType().toUpperCase()) {
            case "CASUAL":
                if (balance.getCasualLeave() < days) {
                    throw new BusinessRuleException("Insufficient casual leave balance (available: " + balance.getCasualLeave() + ", needed: " + days + ")");
                }
                balance.setCasualLeave(balance.getCasualLeave() - days);
                break;
            case "SICK":
                if (balance.getSickLeave() < days) {
                    throw new BusinessRuleException("Insufficient sick leave balance (available: " + balance.getSickLeave() + ", needed: " + days + ")");
                }
                balance.setSickLeave(balance.getSickLeave() - days);
                break;
            case "EARNED":
                if (balance.getEarnedLeave() < days) {
                    throw new BusinessRuleException("Insufficient earned leave balance (available: " + balance.getEarnedLeave() + ", needed: " + days + ")");
                }
                balance.setEarnedLeave(balance.getEarnedLeave() - days);
                break;
            case "UNPAID":
                // Unpaid leave does not deduct paid balance
                break;
            default:
                break;
        }
        
        leaveBalanceRepository.save(balance);
    }

    private void validateBalance(LeaveBalance balance, String leaveType, int days) {
        if ("UNPAID".equalsIgnoreCase(leaveType)) return;

        switch (leaveType.toUpperCase()) {
            case "CASUAL":
                if (balance.getCasualLeave() < days) {
                    throw new BusinessRuleException("Insufficient casual leave balance. Available: " + balance.getCasualLeave() + " days, requested: " + days);
                }
                break;
            case "SICK":
                if (balance.getSickLeave() < days) {
                    throw new BusinessRuleException("Insufficient sick leave balance. Available: " + balance.getSickLeave() + " days, requested: " + days);
                }
                break;
            case "EARNED":
                if (balance.getEarnedLeave() < days) {
                    throw new BusinessRuleException("Insufficient earned leave balance. Available: " + balance.getEarnedLeave() + " days, requested: " + days);
                }
                break;
            default:
                break;
        }
    }

    private int calculateWorkingDays(LocalDate start, LocalDate end) {
        int workingDays = 0;
        LocalDate current = start;
        while (!current.isAfter(end)) {
            DayOfWeek day = current.getDayOfWeek();
            if (day != DayOfWeek.SATURDAY && day != DayOfWeek.SUNDAY) {
                workingDays++;
            }
            current = current.plusDays(1);
        }
        return workingDays;
    }

    public LeaveBalance getLeaveBalance(String email, int year) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with email: " + email));

        return leaveBalanceRepository.findByEmployeeIdAndYear(employee.getId(), year)
                .orElseGet(() -> {
                    LeaveBalance defaultBalance = new LeaveBalance();
                    defaultBalance.setEmployee(employee);
                    defaultBalance.setYear(year);
                    defaultBalance.setCasualLeave(12);
                    defaultBalance.setEarnedLeave(15);
                    defaultBalance.setSickLeave(10);
                    return leaveBalanceRepository.save(defaultBalance);
                });
    }
}
