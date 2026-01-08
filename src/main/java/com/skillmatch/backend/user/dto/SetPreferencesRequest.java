package com.skillmatch.backend.user.dto;

public record SetPreferencesRequest(
        String workFormats,
        String experienceLevel,
        Integer salaryFrom,
        Integer salaryTo,
        String salaryPeriod
) {}
