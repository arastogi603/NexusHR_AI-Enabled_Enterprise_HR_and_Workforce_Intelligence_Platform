package com.zidio.nexushr.employee.mapper;

import com.zidio.nexushr.employee.dto.EmployeeDto;
import com.zidio.nexushr.employee.entity.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {
    EmployeeMapper INSTANCE = Mappers.getMapper(EmployeeMapper.class);

    @Mapping(source = "department.id", target = "departmentId")
    @Mapping(source = "department.name", target = "departmentName")
    @Mapping(source = "manager.id", target = "managerId")
    @Mapping(target = "managerName", expression = "java(employee.getManager() != null ? employee.getManager().getFirstName() + ' ' + employee.getManager().getLastName() : null)")
    EmployeeDto toDto(Employee employee);
}
