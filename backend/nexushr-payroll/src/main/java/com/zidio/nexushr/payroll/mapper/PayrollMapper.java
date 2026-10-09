package com.zidio.nexushr.payroll.mapper;

import com.zidio.nexushr.payroll.dto.PayrollDto;
import com.zidio.nexushr.payroll.entity.PayrollRecord;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface PayrollMapper {
    PayrollMapper INSTANCE = Mappers.getMapper(PayrollMapper.class);

    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(target = "employeeName", expression = "java(payroll.getEmployee().getFirstName() + ' ' + payroll.getEmployee().getLastName())")
    @Mapping(source = "employee.employeeCode", target = "employeeCode")
    PayrollDto toDto(PayrollRecord payroll);
}
