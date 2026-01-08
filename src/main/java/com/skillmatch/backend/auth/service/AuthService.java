package com.skillmatch.backend.auth.service;

import com.skillmatch.backend.auth.dto.*;
import com.skillmatch.backend.auth.email.EmailService;
import com.skillmatch.backend.auth.service.yandex.YandexOAuthService;
import com.skillmatch.backend.config.ApiException;
import com.skillmatch.backend.security.JwtService;
import com.skillmatch.backend.user.model.User;
import com.skillmatch.backend.user.model.UserStatus;
import com.skillmatch.backend.user.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final YandexOAuthService yandexOAuthService;
    private final GoogleIdTokenVerifier googleTokenVerifier;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final EmailCodeRepository emailCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.verification.codeTtlMinutes:10}")
    private long codeTtlMinutes;

    public RegisterInitResponse registerInit(RegisterInitRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new ApiException("Email already in use");
        }

        User u = new User();
        u.setEmail(req.email().toLowerCase());
        u.setFirstName(req.firstName());
        u.setLastName(req.lastName());
        u.setGender(req.gender());
        u.setBirthDate(req.birthDate());
        u.setStatus(UserStatus.NEW);

        u = userRepository.save(u);

        String code = generate6Digits();
        EmailVerificationCode c = new EmailVerificationCode();
        c.setUserId(u.getId());
        c.setCode(code);
        c.setExpiresAt(Instant.now().plus(codeTtlMinutes, ChronoUnit.MINUTES));
        emailCodeRepository.save(c);

        emailService.sendVerificationCode(u.getEmail(), code);
        return new RegisterInitResponse(u.getId(), "Verification code sent");
    }

    public void verifyEmail(VerifyEmailRequest req) {
        EmailVerificationCode code = emailCodeRepository
                .findTopByUserIdOrderByCreatedAtDesc(req.userId())
                .orElseThrow(() -> new ApiException("Verification code not found"));

        if (code.isUsed()) throw new ApiException("Code already used");
        if (Instant.now().isAfter(code.getExpiresAt())) throw new ApiException("Code expired");
        if (!code.getCode().equals(req.code())) throw new ApiException("Invalid code");

        code.setUsed(true);
        emailCodeRepository.save(code);

        User u = userRepository.findById(req.userId())
                .orElseThrow(() -> new ApiException("User not found"));

        u.setStatus(UserStatus.EMAIL_CONFIRMED);
        userRepository.save(u);
    }

    public void setPassword(SetPasswordRequest req) {
        if (!req.password().equals(req.confirmPassword())) {
            throw new ApiException("Passwords do not match");
        }

        User u = userRepository.findById(req.userId())
                .orElseThrow(() -> new ApiException("User not found"));

        if (u.getStatus() != UserStatus.EMAIL_CONFIRMED) {
            throw new ApiException("Email is not confirmed");
        }
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        userRepository.save(u);
    }

    public LoginResponse login(LoginRequest req) {
        User u = userRepository.findByEmail(req.email().toLowerCase())
                .orElseThrow(() -> new ApiException("Invalid credentials"));

        if (u.getPasswordHash() == null) throw new ApiException("Password not set");

        if (!passwordEncoder.matches(req.password(), u.getPasswordHash())) {
            throw new ApiException("Invalid credentials");
        }

        String token = jwtService.issueToken(u.getId(), u.getEmail());
        return new LoginResponse(token, u.getStatus());
    }
    private final GoogleIdTokenVerifier googleVerifier;

    public LoginResponse loginGoogle(GoogleLoginRequest req) {
        GoogleIdTokenVerifier.GoogleUserInfo info = googleVerifier.verify(req.idToken());

        User u = userRepository.findByEmail(info.email()).orElseGet(() -> {
            User nu = new User();
            nu.setEmail(info.email());
            nu.setFirstName(info.firstName());
            nu.setLastName(info.lastName());
            nu.setStatus(info.emailVerified() ? UserStatus.EMAIL_CONFIRMED : UserStatus.NEW);
            return userRepository.save(nu);
        });
        if (info.emailVerified() && u.getStatus() == UserStatus.NEW) {
            u.setStatus(UserStatus.EMAIL_CONFIRMED);
            u = userRepository.save(u);
        }

        String token = jwtService.issueToken(u.getId(), u.getEmail());
        return new LoginResponse(token, u.getStatus());
    }
    public OAuthLoginResponse loginWithYandex(String code) {
        var token = yandexOAuthService.exchangeCode(code);
        var info = yandexOAuthService.fetchUserInfo(token.accessToken());

        String email = (info.defaultEmail() != null ? info.defaultEmail() : null);
        if (email == null || email.isBlank()) {
            throw new ApiException("Yandex аккаунт не вернул email (default_email).");
        }

        var normalizedEmail = email.toLowerCase();

        User u = userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> {
                    User nu = new User();
                    nu.setEmail(normalizedEmail);
                    nu.setStatus(UserStatus.EMAIL_CONFIRMED);
                    return userRepository.save(nu);
                });

        boolean needsOnboarding = true;

        String jwt = jwtService.issueToken(u.getId(), u.getEmail());
        return new OAuthLoginResponse(jwt, u.getStatus(), needsOnboarding);
    }



    private String generate6Digits() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }
}
