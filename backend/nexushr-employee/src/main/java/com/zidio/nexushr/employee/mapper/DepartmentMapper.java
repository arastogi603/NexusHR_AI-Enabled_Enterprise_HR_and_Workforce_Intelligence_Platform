package com.zidio.nexushr.employee.mapper;

import com.zidio.nexushr.employee.dto.DepartmentDto;
import com.zidio.nexushr.employee.entity.Department;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {
    DepartmentMapper INSTANCE = Mappers.getMapper(DepartmentMapper.class);

    @Mapping(source = "head.id", target = "headId")
    @Mapping(target = "headName", expression = "java(department.getHead() != null ? department.getHead().getFirstName() + ' ' + department.getHead().getLastName() : null)")
    @Mapping(source = "parent.id", target = "parentId")
    DepartmentDto toDto(Department department);

    @Mapping(target = "head", ignore = true)
    @Mapping(target = "parent", ignore = true)
    Department toEntity(DepartmentDto departmentDto);
}
