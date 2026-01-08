package com.skillmatch.backend.auth.dto;

import com.skillmatch.backend.user.model.UserStatus;

public record LoginResponse(String accessToken, UserStatus userStatus) {}
