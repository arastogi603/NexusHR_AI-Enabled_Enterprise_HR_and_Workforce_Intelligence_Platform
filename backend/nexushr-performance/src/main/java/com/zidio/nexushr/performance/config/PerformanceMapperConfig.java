package com.zidio.nexushr.performance.config;

import com.zidio.nexushr.performance.mapper.PerformanceMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PerformanceMapperConfig {

    @Bean
    @ConditionalOnMissingBean
    public PerformanceMapper performanceMapper() {
        return PerformanceMapper.INSTANCE;
    }
}
