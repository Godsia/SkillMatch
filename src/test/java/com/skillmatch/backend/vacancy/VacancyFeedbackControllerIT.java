package com.skillmatch.backend.vacancy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillmatch.backend.vacancy.dto.VacancyFeedbackRequest;
import com.skillmatch.backend.vacancy.model.Vacancy;
import com.skillmatch.backend.vacancy.model.VacancyFeedback;
import com.skillmatch.backend.vacancy.repo.VacancyFeedbackRepository;
import com.skillmatch.backend.vacancy.repo.VacancyRepository;
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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@Testcontainers
@ActiveProfiles("test")
class VacancyFeedbackControllerIT {

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
    private VacancyRepository vacancyRepository;

    @Autowired
    private VacancyFeedbackRepository vacancyFeedbackRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private Vacancy testVacancy;
    private Long testUserId;

    @BeforeEach
    void setUp() {
        vacancyFeedbackRepository.deleteAll();
        vacancyRepository.deleteAll();

        User user = new User();
        user.setEmail("feedback_test@example.com");
        user.setPasswordHash("hashed");
        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.save(user);
        testUserId = user.getId();

        testVacancy = Vacancy.builder()
                .source("hh.ru")
                .sourceVacancyId("fb-001")
                .title("Backend Developer")
                .description("Nice vacancy")
                .descriptionPlain("Nice vacancy")
                .url("http://example.com/fb-001")
                .employerName("Yandex")
                .build();
        testVacancy = vacancyRepository.save(testVacancy);
    }

    private Authentication auth() {
        return new UsernamePasswordAuthenticationToken(
                testUserId, null, Collections.emptyList());
    }

    // ── POST /vacancies/{id}/feedback ─────────────────────────────────

    @Test
    void feedback_ShouldSaveNewFeedback() throws Exception {
        VacancyFeedbackRequest req = new VacancyFeedbackRequest();
        req.setLikedMatching(true);
        req.setRating(4);

        mockMvc.perform(post("/vacancies/" + testVacancy.getId() + "/feedback")
                        .with(authentication(auth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        VacancyFeedback saved = vacancyFeedbackRepository
                .findByUserIdAndVacancyId(testUserId, testVacancy.getId())
                .orElseThrow();
        assertThat(saved.isLikedMatching()).isTrue();
        assertThat(saved.getRating()).isEqualTo(4);
    }

    @Test
    void feedback_UpdateExisting_ShouldOverwrite() throws Exception {
        // Первый фидбэк
        VacancyFeedbackRequest req1 = new VacancyFeedbackRequest();
        req1.setLikedMatching(true);
        req1.setRating(3);

        mockMvc.perform(post("/vacancies/" + testVacancy.getId() + "/feedback")
                        .with(authentication(auth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk());

        // Обновляем фидбэк
        VacancyFeedbackRequest req2 = new VacancyFeedbackRequest();
        req2.setLikedMatching(false);
        req2.setRating(5);

        mockMvc.perform(post("/vacancies/" + testVacancy.getId() + "/feedback")
                        .with(authentication(auth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isOk());

        VacancyFeedback saved = vacancyFeedbackRepository
                .findByUserIdAndVacancyId(testUserId, testVacancy.getId())
                .orElseThrow();
        assertThat(saved.isLikedMatching()).isFalse();
        assertThat(saved.getRating()).isEqualTo(5);
    }

    @Test
    void feedback_InvalidRating_ShouldReturn400() throws Exception {
        VacancyFeedbackRequest req = new VacancyFeedbackRequest();
        req.setLikedMatching(true);
        req.setRating(0); // ниже допустимого

        mockMvc.perform(post("/vacancies/" + testVacancy.getId() + "/feedback")
                        .with(authentication(auth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void feedback_NonExistentVacancy_ShouldReturn400() throws Exception {
        VacancyFeedbackRequest req = new VacancyFeedbackRequest();
        req.setLikedMatching(true);
        req.setRating(3);

        mockMvc.perform(post("/vacancies/999999/feedback")
                        .with(authentication(auth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Vacancy not found"));
    }

    // ── GET /vacancies/feedback ───────────────────────────────────────

    @Test
    void allFeedback_ShouldReturnUserFeedbacks() throws Exception {
        // Создадим вторую вакансию
        Vacancy v2 = Vacancy.builder()
                .source("hh.ru")
                .sourceVacancyId("fb-002")
                .title("Frontend Developer")
                .description("React")
                .descriptionPlain("React")
                .url("http://example.com/fb-002")
                .employerName("VK")
                .build();
        v2 = vacancyRepository.save(v2);

        // Два фидбэка
        VacancyFeedback f1 = VacancyFeedback.builder()
                .userId(testUserId)
                .vacancyId(testVacancy.getId())
                .likedMatching(true)
                .rating(5)
                .build();
        vacancyFeedbackRepository.save(f1);

        VacancyFeedback f2 = VacancyFeedback.builder()
                .userId(testUserId)
                .vacancyId(v2.getId())
                .likedMatching(false)
                .rating(2)
                .build();
        vacancyFeedbackRepository.save(f2);

        mockMvc.perform(get("/vacancies/feedback")
                        .with(authentication(auth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].vacancyId").isNumber())
                .andExpect(jsonPath("$[0].rating").isNumber());
    }

    @Test
    void allFeedback_EmptyList_ShouldReturnEmptyArray() throws Exception {
        mockMvc.perform(get("/vacancies/feedback")
                        .with(authentication(auth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void allFeedback_ShouldNotReturnOtherUsersFeedback() throws Exception {
        // Создаём фидбэк от другого пользователя
        User otherUser = new User();
        otherUser.setEmail("other_feedback@example.com");
        otherUser.setPasswordHash("hashed");
        otherUser.setStatus(UserStatus.ACTIVE);
        otherUser = userRepository.save(otherUser);

        VacancyFeedback otherFeedback = VacancyFeedback.builder()
                .userId(otherUser.getId())
                .vacancyId(testVacancy.getId())
                .likedMatching(true)
                .rating(4)
                .build();
        vacancyFeedbackRepository.save(otherFeedback);

        // Наш пользователь не должен видеть чужие фидбэки
        mockMvc.perform(get("/vacancies/feedback")
                        .with(authentication(auth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}


