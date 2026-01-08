package com.skillmatch.backend.user.dto;

public record PreferencesDto(
        String workFormats,
        String experienceLevel,
        Integer salaryFrom,
        Integer salaryTo,
        String salaryPeriod
) {}
