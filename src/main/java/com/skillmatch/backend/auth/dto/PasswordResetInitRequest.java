package com.skillmatch.backend.auth.dto;

import jakarta.validation.constraints.*;

public record PasswordResetInitRequest(
    @Email @NotBlank String email
) {}