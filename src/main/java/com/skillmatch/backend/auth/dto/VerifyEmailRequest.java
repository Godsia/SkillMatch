package com.skillmatch.backend.auth.dto;

import jakarta.validation.constraints.*;

public record VerifyEmailRequest(
        @NotNull Long userId,
        @Pattern(regexp = "\\d{6}") String code
) {}
