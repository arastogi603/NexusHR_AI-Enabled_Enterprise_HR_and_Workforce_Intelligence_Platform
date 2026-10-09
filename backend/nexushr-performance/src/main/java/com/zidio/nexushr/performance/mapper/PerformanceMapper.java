package com.zidio.nexushr.performance.mapper;

import com.zidio.nexushr.performance.dto.GoalDto;
import com.zidio.nexushr.performance.dto.PerformanceReviewDto;
import com.zidio.nexushr.performance.entity.Goal;
import com.zidio.nexushr.performance.entity.PerformanceReview;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface PerformanceMapper {
    PerformanceMapper INSTANCE = Mappers.getMapper(PerformanceMapper.class);

    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(target = "employeeName", expression = "java(goal.getEmployee() != null ? goal.getEmployee().getFirstName() + ' ' + goal.getEmployee().getLastName() : null)")
    GoalDto toGoalDto(Goal goal);

    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(target = "employeeName", expression = "java(review.getEmployee() != null ? review.getEmployee().getFirstName() + ' ' + review.getEmployee().getLastName() : null)")
    @Mapping(source = "reviewer.id", target = "reviewerId")
    @Mapping(target = "reviewerName", expression = "java(review.getReviewer() != null ? review.getReviewer().getFirstName() + ' ' + review.getReviewer().getLastName() : null)")
    PerformanceReviewDto toReviewDto(PerformanceReview review);
}
