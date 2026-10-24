package com.zidio.nexushr.employee.config;

import com.zidio.nexushr.employee.mapper.AttendanceMapper;
import com.zidio.nexushr.employee.mapper.DepartmentMapper;
import com.zidio.nexushr.employee.mapper.EmployeeMapper;
import com.zidio.nexushr.employee.mapper.LeaveMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EmployeeMapperConfig {

    @Bean
    @ConditionalOnMissingBean
    public AttendanceMapper attendanceMapper() {
        return AttendanceMapper.INSTANCE;
    }

    @Bean
    @ConditionalOnMissingBean
    public DepartmentMapper departmentMapper() {
        return DepartmentMapper.INSTANCE;
    }

    @Bean
    @ConditionalOnMissingBean
    public EmployeeMapper employeeMapper() {
        return EmployeeMapper.INSTANCE;
    }

    @Bean
    @ConditionalOnMissingBean
    public LeaveMapper leaveMapper() {
        return LeaveMapper.INSTANCE;
    }
}
