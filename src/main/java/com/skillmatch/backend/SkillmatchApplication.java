package com.skillmatch.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SkillmatchApplication {

	public static void main(String[] args) {
		SpringApplication.run(SkillmatchApplication.class, args);
	}

}