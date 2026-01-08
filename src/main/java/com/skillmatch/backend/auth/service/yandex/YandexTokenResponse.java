package com.skillmatch.backend.auth.service.yandex;

import com.fasterxml.jackson.annotation.JsonProperty;

public record YandexTokenResponse(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("token_type") String tokenType,
        @JsonProperty("expires_in") Long expiresIn,
        @JsonProperty("refresh_token") String refreshToken,
        @JsonProperty("scope") String scope
) {}
