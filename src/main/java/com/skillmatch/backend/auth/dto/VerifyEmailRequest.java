package com.skillmatch.backend.auth.dto;

import jakarta.validation.constraints.*;

public record VerifyEmailRequest(
        @Pattern(regexp = "\\d{6}") String code
) {}
