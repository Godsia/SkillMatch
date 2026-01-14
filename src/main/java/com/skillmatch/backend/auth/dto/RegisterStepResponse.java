package com.skillmatch.backend.auth.dto;

import com.skillmatch.backend.user.model.UserStatus;

public record RegisterStepResponse(UserStatus userStatus) {}
