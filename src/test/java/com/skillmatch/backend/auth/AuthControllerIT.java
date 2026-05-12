package com.skillmatch.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillmatch.backend.auth.dto.LoginRequest;
import com.skillmatch.backend.auth.dto.RegisterInitRequest;
import com.skillmatch.backend.auth.dto.SetPasswordRequest;
import com.skillmatch.backend.auth.dto.VerifyEmailRequest;
import com.skillmatch.backend.auth.service.EmailCodeRepository;
import com.skillmatch.backend.auth.service.EmailVerificationCode;
import com.skillmatch.backend.user.model.Gender;
import com.skillmatch.backend.user.model.User;
import com.skillmatch.backend.user.model.UserStatus;
import com.skillmatch.backend.user.repo.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@Testcontainers
@ActiveProfiles("test")
class AuthControllerIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("skillmatch_test")
            .withUsername("skillmatch")
            .withPassword("skillmatch");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailCodeRepository emailCodeRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules();

    @BeforeEach
    void setUp() {
        emailCodeRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void registerInit_ShouldCreateNewUserAndReturnToken() throws Exception {
        RegisterInitRequest req = new RegisterInitRequest(
                "Ivan", "Ivanov", Gender.MALE,
                LocalDate.of(2000, 1, 15), "new_user@example.com"
        );

        mockMvc.perform(post("/auth/register/init")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.userStatus").value("NEW"))
                .andExpect(jsonPath("$.message").value("Verification code sent"));

        assertThat(userRepository.findByEmail("new_user@example.com")).isPresent();
    }

    @Test
    void registerInit_DuplicateActiveEmail_ShouldReturnBadRequest() throws Exception {
        User u = new User();
        u.setEmail("active@example.com");
        u.setPasswordHash("hashed");
        u.setStatus(UserStatus.ACTIVE);
        userRepository.save(u);

        RegisterInitRequest req = new RegisterInitRequest(
                "Ivan", "Ivanov", Gender.MALE,
                LocalDate.of(2000, 1, 15), "active@example.com"
        );

        mockMvc.perform(post("/auth/register/init")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email already in use"));
    }

    @Test
    void registerInit_ReRegisterUnconfirmedEmail_ShouldSucceed() throws Exception {
        User u = new User();
        u.setEmail("unconfirmed@example.com");
        u.setStatus(UserStatus.NEW);
        userRepository.save(u);

        RegisterInitRequest req = new RegisterInitRequest(
                "Petr", "Petrov", Gender.MALE,
                LocalDate.of(1995, 5, 10), "unconfirmed@example.com"
        );

        mockMvc.perform(post("/auth/register/init")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userStatus").value("NEW"));

        User updated = userRepository.findByEmail("unconfirmed@example.com").orElseThrow();
        assertThat(updated.getFirstName()).isEqualTo("Petr");
    }

    @Test
    void verifyEmail_ValidCode_ShouldConfirmEmail() throws Exception {
        User u = new User();
        u.setEmail("verify@example.com");
        u.setStatus(UserStatus.NEW);
        u = userRepository.save(u);

        EmailVerificationCode code = new EmailVerificationCode();
        code.setUserId(u.getId());
        code.setCode("123456");
        code.setExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        emailCodeRepository.save(code);

        Authentication auth = new UsernamePasswordAuthenticationToken(
                u.getId(), null, Collections.emptyList());

        VerifyEmailRequest req = new VerifyEmailRequest("123456");

        mockMvc.perform(post("/auth/register/verify-email")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userStatus").value("EMAIL_CONFIRMED"));
    }

    @Test
    void verifyEmail_InvalidCode_ShouldReturnBadRequest() throws Exception {
        User u = new User();
        u.setEmail("verify2@example.com");
        u.setStatus(UserStatus.NEW);
        u = userRepository.save(u);

        EmailVerificationCode code = new EmailVerificationCode();
        code.setUserId(u.getId());
        code.setCode("111111");
        code.setExpiresAt(Instant.now().plus(10, ChronoUnit.MINUTES));
        emailCodeRepository.save(code);

        Authentication auth = new UsernamePasswordAuthenticationToken(
                u.getId(), null, Collections.emptyList());

        VerifyEmailRequest req = new VerifyEmailRequest("999999");

        mockMvc.perform(post("/auth/register/verify-email")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid code"));
    }

    @Test
    void verifyEmail_ExpiredCode_ShouldReturnBadRequest() throws Exception {
        User u = new User();
        u.setEmail("verify3@example.com");
        u.setStatus(UserStatus.NEW);
        u = userRepository.save(u);

        EmailVerificationCode code = new EmailVerificationCode();
        code.setUserId(u.getId());
        code.setCode("123456");
        code.setExpiresAt(Instant.now().minus(1, ChronoUnit.MINUTES));
        emailCodeRepository.save(code);

        Authentication auth = new UsernamePasswordAuthenticationToken(
                u.getId(), null, Collections.emptyList());

        VerifyEmailRequest req = new VerifyEmailRequest("123456");

        mockMvc.perform(post("/auth/register/verify-email")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Code expired"));
    }

    @Test
    void setPassword_ShouldActivateUser() throws Exception {
        User u = new User();
        u.setEmail("setpass@example.com");
        u.setStatus(UserStatus.EMAIL_CONFIRMED);
        u = userRepository.save(u);

        Authentication auth = new UsernamePasswordAuthenticationToken(
                u.getId(), null, Collections.emptyList());

        SetPasswordRequest req = new SetPasswordRequest("secret123", "secret123");

        mockMvc.perform(post("/auth/register/set-password")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userStatus").value("ACTIVE"));

        User updated = userRepository.findById(u.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(UserStatus.ACTIVE);
        assertThat(updated.getPasswordHash()).isNotNull();
    }

    @Test
    void setPassword_MismatchedPasswords_ShouldReturnBadRequest() throws Exception {
        User u = new User();
        u.setEmail("mismatch@example.com");
        u.setStatus(UserStatus.EMAIL_CONFIRMED);
        u = userRepository.save(u);

        Authentication auth = new UsernamePasswordAuthenticationToken(
                u.getId(), null, Collections.emptyList());

        SetPasswordRequest req = new SetPasswordRequest("secret123", "different");

        mockMvc.perform(post("/auth/register/set-password")
                        .with(authentication(auth))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Passwords do not match"));
    }


    @Test
    void login_ValidCredentials_ShouldReturnToken() throws Exception {
        User u = new User();
        u.setEmail("login@example.com");
        u.setPasswordHash(passwordEncoder.encode("mypassword"));
        u.setStatus(UserStatus.ACTIVE);
        userRepository.save(u);

        LoginRequest req = new LoginRequest("login@example.com", "mypassword");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.userStatus").value("ACTIVE"));
    }

    @Test
    void login_WrongPassword_ShouldReturnBadRequest() throws Exception {
        User u = new User();
        u.setEmail("wrong@example.com");
        u.setPasswordHash(passwordEncoder.encode("correctpwd"));
        u.setStatus(UserStatus.ACTIVE);
        userRepository.save(u);

        LoginRequest req = new LoginRequest("wrong@example.com", "wrongpwd");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    void login_NonExistentUser_ShouldReturnBadRequest() throws Exception {
        LoginRequest req = new LoginRequest("nobody@example.com", "password");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }
}

