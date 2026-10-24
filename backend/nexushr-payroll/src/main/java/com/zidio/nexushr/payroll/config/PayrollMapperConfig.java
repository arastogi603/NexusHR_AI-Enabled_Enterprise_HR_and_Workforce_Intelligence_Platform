package com.zidio.nexushr.payroll.config;

import com.zidio.nexushr.payroll.mapper.PayrollMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PayrollMapperConfig {

    @Bean
    @ConditionalOnMissingBean
    public PayrollMapper payrollMapper() {
        return PayrollMapper.INSTANCE;
    }
}
