package org.example.comprova;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableAsync
public class ComprovaApplication {
    public static void main(String[] args) {
        SpringApplication.run(ComprovaApplication.class, args);
    }
}
