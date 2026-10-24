package com.zidio.nexushr.employee.mapper;

import com.zidio.nexushr.employee.dto.DepartmentDto;
import com.zidio.nexushr.employee.entity.Department;
import org.springframework.stereotype.Component;

@Component
public class DepartmentMapper {
    public static final DepartmentMapper INSTANCE = new DepartmentMapper();

    public DepartmentDto toDto(Department department) {
        if (department == null) return null;
        DepartmentDto dto = new DepartmentDto();
        dto.setId(department.getId());
        dto.setName(department.getName());
        dto.setDescription(department.getDescription());
        if (department.getHead() != null) {
            dto.setHeadId(department.getHead().getId());
            dto.setHeadName(department.getHead().getFirstName() + " " + department.getHead().getLastName());
        }
        if (department.getParent() != null) {
            dto.setParentId(department.getParent().getId());
        }
        return dto;
    }

    public Department toEntity(DepartmentDto dto) {
        if (dto == null) return null;
        Department dept = new Department();
        dept.setId(dto.getId());
        dept.setName(dto.getName());
        dept.setDescription(dto.getDescription());
        return dept;
    }
}
