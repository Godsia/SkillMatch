package com.skillmatch.backend.auth.service.yandex;

import com.skillmatch.backend.config.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class YandexOAuthService {

    private final RestClient restClient = RestClient.create();

    @Value("${app.oauth.yandex.clientId}")
    private String clientId;

    @Value("${app.oauth.yandex.clientSecret}")
    private String clientSecret;

    @Value("${app.oauth.yandex.redirectUri}")
    private String redirectUri;

    public YandexTokenResponse exchangeCode(String code) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("code", code);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("redirect_uri", redirectUri);

        try {
            return restClient.post()
                    .uri("https://oauth.yandex.ru/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(YandexTokenResponse.class);
        } catch (Exception e) {
            throw new ApiException("Yandex token exchange failed: " + e.getMessage());
        }
    }

    public YandexUserInfo fetchUserInfo(String accessToken) {
        try {
            return restClient.get()
                    .uri("https://login.yandex.ru/info?format=json")
                    .header(HttpHeaders.AUTHORIZATION, "OAuth " + accessToken)
                    .retrieve()
                    .body(YandexUserInfo.class);
        } catch (Exception e) {
            throw new ApiException("Yandex userinfo failed: " + e.getMessage());
        }
    }
}
