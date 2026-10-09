package com.zidio.nexushr.employee.mapper;

import com.zidio.nexushr.employee.dto.AttendanceDto;
import com.zidio.nexushr.employee.entity.Attendance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AttendanceMapper {
    AttendanceMapper INSTANCE = Mappers.getMapper(AttendanceMapper.class);

    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(target = "employeeName", expression = "java(attendance.getEmployee().getFirstName() + ' ' + attendance.getEmployee().getLastName())")
    AttendanceDto toDto(Attendance attendance);
}
