package com.basketball.teams;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class TeamsServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(TeamsServiceApplication.class, args);
    }
}
