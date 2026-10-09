package com.zidio.nexushr.employee.service;

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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.context.ApplicationEventPublisher;
import com.zidio.nexushr.common.event.NotificationEvent;

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
            throw new RuntimeException("End date cannot be before start date");
        }

        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        List<Leave> overlaps = leaveRepository.findOverlappingLeaves(
                employee.getId(), request.getStartDate(), request.getEndDate());
        
        if (!overlaps.isEmpty()) {
            throw new RuntimeException("Leave dates overlap with an existing request");
        }

        Leave leave = new Leave();
        leave.setEmployee(employee);
        leave.setLeaveType(request.getLeaveType());
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setReason(request.getReason());
        leave.setStatus("PENDING");

        leave = leaveRepository.save(leave);
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

    @Transactional
    public LeaveDto processLeaveRequest(String managerEmail, UUID leaveId, boolean approve) {
        Employee manager = employeeRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));

        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found"));

        if (!leave.getStatus().equals("PENDING")) {
            throw new RuntimeException("Leave request is already processed");
        }

        // Check if the current user is actually the manager of the requesting employee or an admin
        if (!manager.getId().equals(leave.getEmployee().getManager().getId())) {
            throw new RuntimeException("Unauthorized to process this leave request");
        }

        leave.setApprovedBy(manager);

        if (approve) {
            leave.setStatus("APPROVED");
            deductLeaveBalance(leave);
            
            eventPublisher.publishEvent(NotificationEvent.builder()
                .recipientEmail(leave.getEmployee().getEmail())
                .subject("Leave Request Approved")
                .message("Your leave request from " + leave.getStartDate() + " to " + leave.getEndDate() + " has been approved.")
                .sendEmail(true)
                .build());
        } else {
            leave.setStatus("REJECTED");
            
            eventPublisher.publishEvent(NotificationEvent.builder()
                .recipientEmail(leave.getEmployee().getEmail())
                .subject("Leave Request Rejected")
                .message("Your leave request from " + leave.getStartDate() + " to " + leave.getEndDate() + " has been rejected.")
                .sendEmail(true)
                .build());
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

        int days = (int) ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;

        switch (leave.getLeaveType().toUpperCase()) {
            case "CASUAL":
                if (balance.getCasualLeave() < days) throw new RuntimeException("Insufficient casual leave balance");
                balance.setCasualLeave(balance.getCasualLeave() - days);
                break;
            case "SICK":
                if (balance.getSickLeave() < days) throw new RuntimeException("Insufficient sick leave balance");
                balance.setSickLeave(balance.getSickLeave() - days);
                break;
            case "EARNED":
                if (balance.getEarnedLeave() < days) throw new RuntimeException("Insufficient earned leave balance");
                balance.setEarnedLeave(balance.getEarnedLeave() - days);
                break;
            default:
                throw new RuntimeException("Unsupported leave type: " + leave.getLeaveType());
        }
        
        leaveBalanceRepository.save(balance);
    }

    public LeaveBalance getLeaveBalance(String email, int year) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        return leaveBalanceRepository.findByEmployeeIdAndYear(employee.getId(), year)
                .orElseGet(() -> {
                    LeaveBalance defaultBalance = new LeaveBalance();
                    defaultBalance.setEmployee(employee);
                    defaultBalance.setYear(year);
                    return defaultBalance;
                });
    }
}
