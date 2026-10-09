package com.zidio.nexushr.employee.mapper;

import com.zidio.nexushr.employee.dto.LeaveDto;
import com.zidio.nexushr.employee.entity.Leave;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface LeaveMapper {
    LeaveMapper INSTANCE = Mappers.getMapper(LeaveMapper.class);

    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(target = "employeeName", expression = "java(leave.getEmployee() != null ? leave.getEmployee().getFirstName() + ' ' + leave.getEmployee().getLastName() : null)")
    @Mapping(source = "approvedBy.id", target = "approvedById")
    @Mapping(target = "approvedByName", expression = "java(leave.getApprovedBy() != null ? leave.getApprovedBy().getFirstName() + ' ' + leave.getApprovedBy().getLastName() : null)")
    LeaveDto toDto(Leave leave);
}
