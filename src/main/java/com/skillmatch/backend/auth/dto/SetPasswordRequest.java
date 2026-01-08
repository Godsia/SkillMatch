package com.skillmatch.backend.auth.dto;

import jakarta.validation.constraints.*;

public record SetPasswordRequest(
        @NotNull Long userId,
        @Size(min = 6) String password,
        @Size(min = 6) String confirmPassword
) {}
