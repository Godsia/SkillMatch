package com.skillmatch.backend.auth.controller;

import com.skillmatch.backend.auth.dto.*;
import com.skillmatch.backend.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
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
    public RegisterStepResponse verifyEmail(Authentication auth, @Valid @RequestBody VerifyEmailRequest req) {
        Long userId = (Long) auth.getPrincipal();
        return authService.verifyEmail(userId, req);
    }

    @PostMapping("/register/set-password")
    public RegisterStepResponse setPassword(Authentication auth, @Valid @RequestBody SetPasswordRequest req) {
        Long userId = (Long) auth.getPrincipal();
        return authService.setPassword(userId, req);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }
}
