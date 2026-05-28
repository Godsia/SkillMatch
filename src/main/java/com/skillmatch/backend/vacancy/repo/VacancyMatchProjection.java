package com.skillmatch.backend.vacancy.repo;
public interface VacancyMatchProjection {
    Long getId();
    String getExperienceLevel();
    Integer getSalaryFrom();
    Integer getSalaryTo();
    String getEmploymentType();
    String getWorkFormat();
    String getWorkSchedule();
    Long getSkillId();
}