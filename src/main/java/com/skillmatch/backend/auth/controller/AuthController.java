package com.skillmatch.backend.auth.controller;

import com.skillmatch.backend.auth.dto.*;
import com.skillmatch.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/init")
    public RegisterInitResponse init(@Valid @RequestBody RegisterInitRequest req) {
        return authService.registerInit(req);
    }
    @PostMapping("/yandex")
    public OAuthLoginResponse yandex(@RequestBody @Valid YandexAuthCodeRequest req) {
        return authService.loginWithYandex(req.code());
    }


    @PostMapping("/google")
    public LoginResponse google(@RequestBody GoogleLoginRequest req) {
        return authService.loginGoogle(req);
    }

    @PostMapping("/register/verify-email")
    public void verifyEmail(@Valid @RequestBody VerifyEmailRequest req) {
        authService.verifyEmail(req);
    }

    @PostMapping("/register/set-password")
    public void setPassword(@Valid @RequestBody SetPasswordRequest req) {
        authService.setPassword(req);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }
}
