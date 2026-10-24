package com.zidio.nexushr.common.event;

import lombok.Builder;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class AttritionRiskChangedEvent extends ApplicationEvent {

    private final UUID employeeId;
    private final String employeeName;
    private final String departmentName;
    private final String oldLevel;
    private final String newLevel;
    private final double score;

    @Builder
    public AttritionRiskChangedEvent(Object source, UUID employeeId, String employeeName, String departmentName, String oldLevel, String newLevel, double score) {
        super(source);
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.departmentName = departmentName;
        this.oldLevel = oldLevel;
        this.newLevel = newLevel;
        this.score = score;
    }
}
