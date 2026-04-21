package com.skillmatch.backend.user.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record SetPreferencesRequest(
        String workFormats,
        String employmentTypes,
        String experienceLevel,
        @Min(0) Integer salaryFrom,
        @Min(0) Integer salaryTo,
        @Size(max = 20) String salaryPeriod
) {}
