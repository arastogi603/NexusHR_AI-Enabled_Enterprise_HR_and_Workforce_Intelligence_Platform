package com.zidio.nexushr.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class NexusHrApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexusHrApplication.class, args);
    }
}
