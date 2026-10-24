package com.zidio.nexushr.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication(scanBasePackages = "com.zidio.nexushr")
@EnableJpaRepositories(basePackages = "com.zidio.nexushr")
@EntityScan(basePackages = "com.zidio.nexushr")
@EnableJpaAuditing
@EnableAsync
public class NexusHrApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexusHrApplication.class, args);
    }
}
