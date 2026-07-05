package com.healthflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class HealthFlowApplication {

    public static void main(String[] args) {
        SpringApplication.run(HealthFlowApplication.class, args);
    }
}
