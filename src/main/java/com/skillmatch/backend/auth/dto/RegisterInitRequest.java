package com.skillmatch.backend.auth.dto;

import com.skillmatch.backend.user.model.Gender;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

public record RegisterInitRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotNull Gender gender,
        @NotNull LocalDate birthDate,
        @Email @NotBlank String email
) {}
