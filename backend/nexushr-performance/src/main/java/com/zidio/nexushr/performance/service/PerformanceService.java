package com.zidio.nexushr.performance.service;

import com.zidio.nexushr.common.exception.ResourceNotFoundException;
import com.zidio.nexushr.employee.entity.Employee;
import com.zidio.nexushr.employee.repository.EmployeeRepository;
import com.zidio.nexushr.performance.dto.GoalDto;
import com.zidio.nexushr.performance.dto.PerformanceReviewDto;
import com.zidio.nexushr.performance.entity.Goal;
import com.zidio.nexushr.performance.entity.PerformanceReview;
import com.zidio.nexushr.performance.mapper.PerformanceMapper;
import com.zidio.nexushr.performance.repository.GoalRepository;
import com.zidio.nexushr.performance.repository.PerformanceReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PerformanceService {

    private final GoalRepository goalRepository;
    private final PerformanceReviewRepository reviewRepository;
    private final EmployeeRepository employeeRepository;
    private final PerformanceMapper mapper;

    public PerformanceService(GoalRepository goalRepository,
                              PerformanceReviewRepository reviewRepository,
                              EmployeeRepository employeeRepository,
                              PerformanceMapper mapper) {
        this.goalRepository = goalRepository;
        this.reviewRepository = reviewRepository;
        this.employeeRepository = employeeRepository;
        this.mapper = mapper;
    }

    @Transactional
    public GoalDto createGoal(String managerEmail, GoalDto request) {
        Employee manager = employeeRepository.findByEmail(managerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (!employee.getManager().getId().equals(manager.getId())) {
            throw new RuntimeException("Unauthorized: Can only create goals for direct reports");
        }

        Goal goal = new Goal();
        goal.setEmployee(employee);
        goal.setTitle(request.getTitle());
        goal.setDescription(request.getDescription());
        goal.setStartDate(request.getStartDate());
        goal.setEndDate(request.getEndDate());
        
        goal = goalRepository.save(goal);
        return mapper.toGoalDto(goal);
    }

    @Transactional
    public GoalDto updateGoalProgress(String employeeEmail, UUID goalId, int percentage, String status) {
        Employee employee = employeeRepository.findByEmail(employeeEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        if (!goal.getEmployee().getId().equals(employee.getId())) {
            throw new RuntimeException("Unauthorized: Can only update your own goals");
        }

        goal.setCompletionPercentage(percentage);
        goal.setStatus(status);

        goal = goalRepository.save(goal);
        return mapper.toGoalDto(goal);
    }

    public List<GoalDto> getEmployeeGoals(UUID employeeId) {
        return goalRepository.findByEmployeeId(employeeId).stream()
                .map(mapper::toGoalDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PerformanceReviewDto createReview(String reviewerEmail, PerformanceReviewDto request) {
        Employee reviewer = employeeRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if (!employee.getManager().getId().equals(reviewer.getId())) {
            throw new RuntimeException("Unauthorized: Can only review direct reports");
        }

        PerformanceReview review = new PerformanceReview();
        review.setEmployee(employee);
        review.setReviewer(reviewer);
        review.setReviewPeriod(request.getReviewPeriod());
        review.setScore(request.getScore());
        review.setFeedback(request.getFeedback());
        review.setStatus("PUBLISHED");

        review = reviewRepository.save(review);
        return mapper.toReviewDto(review);
    }

    public List<PerformanceReviewDto> getEmployeeReviews(UUID employeeId) {
        return reviewRepository.findByEmployeeId(employeeId).stream()
                .map(mapper::toReviewDto)
                .collect(Collectors.toList());
    }
}
