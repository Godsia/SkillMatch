package com.skillmatch.backend.user.dto;

import com.skillmatch.backend.user.model.Gender;
import com.skillmatch.backend.user.model.UserStatus;

import java.time.LocalDate;
import java.util.List;

public record MeResponse(
        Long id,
        String email,
        String firstName,
        String lastName,
        Gender gender,
        LocalDate birthDate,
        UserStatus status,
        List<String> skills,
        PreferencesDto preferences
) {}
