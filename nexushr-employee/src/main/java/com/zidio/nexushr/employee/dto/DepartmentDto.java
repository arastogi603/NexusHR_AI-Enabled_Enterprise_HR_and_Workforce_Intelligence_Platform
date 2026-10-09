package com.zidio.nexushr.employee.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class DepartmentDto {
    private UUID id;
    private String name;
    private String description;
    private UUID headId;
    private String headName;
    private UUID parentId;
}
