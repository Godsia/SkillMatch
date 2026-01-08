package com.skillmatch.backend.auth.service.yandex;

import com.fasterxml.jackson.annotation.JsonProperty;

public record YandexUserInfo(
        String id,
        String login,
        @JsonProperty("default_email") String defaultEmail,
        @JsonProperty("display_name") String displayName,
        @JsonProperty("real_name") String realName
) {}
