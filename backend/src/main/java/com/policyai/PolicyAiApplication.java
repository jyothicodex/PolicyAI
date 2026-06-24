package com.policyai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PolicyAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(PolicyAiApplication.class, args);
    }
}
