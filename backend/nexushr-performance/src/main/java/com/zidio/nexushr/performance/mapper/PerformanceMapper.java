package com.zidio.nexushr.performance.mapper;

import com.zidio.nexushr.performance.dto.GoalDto;
import com.zidio.nexushr.performance.dto.PerformanceReviewDto;
import com.zidio.nexushr.performance.entity.Goal;
import com.zidio.nexushr.performance.entity.PerformanceReview;
import org.springframework.stereotype.Component;

@Component
public class PerformanceMapper {
    public static final PerformanceMapper INSTANCE = new PerformanceMapper();

    public GoalDto toGoalDto(Goal goal) {
        if (goal == null) return null;
        GoalDto dto = new GoalDto();
        dto.setId(goal.getId());
        dto.setTitle(goal.getTitle());
        dto.setDescription(goal.getDescription());
        dto.setStartDate(goal.getStartDate());
        dto.setEndDate(goal.getEndDate());
        dto.setCompletionPercentage(goal.getCompletionPercentage());
        dto.setStatus(goal.getStatus());
        if (goal.getEmployee() != null) {
            dto.setEmployeeId(goal.getEmployee().getId());
            dto.setEmployeeName(goal.getEmployee().getFirstName() + " " + goal.getEmployee().getLastName());
        }
        return dto;
    }

    public PerformanceReviewDto toReviewDto(PerformanceReview review) {
        if (review == null) return null;
        PerformanceReviewDto dto = new PerformanceReviewDto();
        dto.setId(review.getId());
        dto.setReviewPeriod(review.getReviewPeriod());
        dto.setScore(review.getScore());
        dto.setFeedback(review.getFeedback());
        dto.setStatus(review.getStatus());
        if (review.getEmployee() != null) {
            dto.setEmployeeId(review.getEmployee().getId());
            dto.setEmployeeName(review.getEmployee().getFirstName() + " " + review.getEmployee().getLastName());
        }
        if (review.getReviewer() != null) {
            dto.setReviewerId(review.getReviewer().getId());
            dto.setReviewerName(review.getReviewer().getFirstName() + " " + review.getReviewer().getLastName());
        }
        return dto;
    }
}
