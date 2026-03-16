package com.skillmatch.backend.vacancy;

import com.skillmatch.backend.config.ApiException;
import com.skillmatch.backend.user.model.User;
import com.skillmatch.backend.user.model.UserStatus;
import com.skillmatch.backend.user.repo.UserRepository;
import com.skillmatch.backend.vacancy.dto.VacancyFeedbackResponse;
import com.skillmatch.backend.vacancy.model.Vacancy;
import com.skillmatch.backend.vacancy.model.VacancyFeedback;
import com.skillmatch.backend.vacancy.repo.VacancyFeedbackRepository;
import com.skillmatch.backend.vacancy.repo.VacancyRepository;
import com.skillmatch.backend.vacancy.service.VacancyFeedbackService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
@Testcontainers
@ActiveProfiles("test")
class VacancyFeedbackServiceIT {

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
    private VacancyFeedbackService vacancyFeedbackService;

    @Autowired
    private VacancyRepository vacancyRepository;

    @Autowired
    private VacancyFeedbackRepository vacancyFeedbackRepository;

    @Autowired
    private UserRepository userRepository;

    private Long userId;
    private Vacancy testVacancy;

    @BeforeEach
    void setUp() {
        vacancyFeedbackRepository.deleteAll();
        vacancyRepository.deleteAll();

        User user = new User();
        user.setEmail("fb_svc_test@example.com");
        user.setPasswordHash("hashed");
        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.save(user);
        userId = user.getId();

        testVacancy = Vacancy.builder()
                .source("hh.ru")
                .sourceVacancyId("fs-001")
                .title("DevOps Engineer")
                .description("desc")
                .descriptionPlain("desc")
                .url("http://example.com/fs-001")
                .employerName("SberTech")
                .build();
        testVacancy = vacancyRepository.save(testVacancy);
    }

    // ── saveFeedback ──────────────────────────────────────────────────

    @Test
    void saveFeedback_ShouldCreateNewRecord() {
        vacancyFeedbackService.saveFeedback(userId, testVacancy.getId(), true, 4);

        VacancyFeedback fb = vacancyFeedbackRepository
                .findByUserIdAndVacancyId(userId, testVacancy.getId())
                .orElseThrow();
        assertThat(fb.isLikedMatching()).isTrue();
        assertThat(fb.getRating()).isEqualTo(4);
        assertThat(fb.getCreatedAt()).isNotNull();
    }

    @Test
    void saveFeedback_ShouldUpdateExistingRecord() {
        vacancyFeedbackService.saveFeedback(userId, testVacancy.getId(), true, 3);
        vacancyFeedbackService.saveFeedback(userId, testVacancy.getId(), false, 5);

        VacancyFeedback fb = vacancyFeedbackRepository
                .findByUserIdAndVacancyId(userId, testVacancy.getId())
                .orElseThrow();
        assertThat(fb.isLikedMatching()).isFalse();
        assertThat(fb.getRating()).isEqualTo(5);
    }

    @Test
    void saveFeedback_NonExistentVacancy_ShouldThrow() {
        assertThatThrownBy(() -> vacancyFeedbackService.saveFeedback(userId, 999999L, true, 3))
                .isInstanceOf(ApiException.class)
                .hasMessage("Vacancy not found");
    }

    @Test
    void saveFeedback_RatingTooLow_ShouldThrow() {
        assertThatThrownBy(() -> vacancyFeedbackService.saveFeedback(userId, testVacancy.getId(), true, 0))
                .isInstanceOf(ApiException.class)
                .hasMessage("Rating must be between 1 and 5");
    }

    @Test
    void saveFeedback_RatingTooHigh_ShouldThrow() {
        assertThatThrownBy(() -> vacancyFeedbackService.saveFeedback(userId, testVacancy.getId(), true, 6))
                .isInstanceOf(ApiException.class)
                .hasMessage("Rating must be between 1 and 5");
    }

    @Test
    void saveFeedback_BoundaryRatings_ShouldSucceed() {
        vacancyFeedbackService.saveFeedback(userId, testVacancy.getId(), true, 1);
        assertThat(vacancyFeedbackRepository.findByUserIdAndVacancyId(userId, testVacancy.getId())
                .orElseThrow().getRating()).isEqualTo(1);

        vacancyFeedbackService.saveFeedback(userId, testVacancy.getId(), true, 5);
        assertThat(vacancyFeedbackRepository.findByUserIdAndVacancyId(userId, testVacancy.getId())
                .orElseThrow().getRating()).isEqualTo(5);
    }

    // ── getAllFeedback ─────────────────────────────────────────────────

    @Test
    void getAllFeedback_ShouldReturnAllForUser() {
        Vacancy v2 = Vacancy.builder()
                .source("hh.ru")
                .sourceVacancyId("fs-002")
                .title("QA Engineer")
                .description("desc")
                .descriptionPlain("desc")
                .url("http://example.com/fs-002")
                .employerName("VK")
                .build();
        v2 = vacancyRepository.save(v2);

        vacancyFeedbackService.saveFeedback(userId, testVacancy.getId(), true, 4);
        vacancyFeedbackService.saveFeedback(userId, v2.getId(), false, 2);

        List<VacancyFeedbackResponse> feedbacks = vacancyFeedbackService.getAllFeedback(userId);

        assertThat(feedbacks).hasSize(2);
        assertThat(feedbacks).extracting(VacancyFeedbackResponse::getRating).containsExactlyInAnyOrder(4, 2);
    }

    @Test
    void getAllFeedback_Empty_ShouldReturnEmptyList() {
        List<VacancyFeedbackResponse> feedbacks = vacancyFeedbackService.getAllFeedback(userId);
        assertThat(feedbacks).isEmpty();
    }

    @Test
    void getAllFeedback_ShouldNotIncludeOtherUsersFeedback() {
        User otherUser = new User();
        otherUser.setEmail("other_fb_svc@example.com");
        otherUser.setPasswordHash("hashed");
        otherUser.setStatus(UserStatus.ACTIVE);
        otherUser = userRepository.save(otherUser);

        vacancyFeedbackService.saveFeedback(userId, testVacancy.getId(), true, 5);
        vacancyFeedbackService.saveFeedback(otherUser.getId(), testVacancy.getId(), false, 1);

        List<VacancyFeedbackResponse> myFeedbacks = vacancyFeedbackService.getAllFeedback(userId);
        assertThat(myFeedbacks).hasSize(1);
        assertThat(myFeedbacks.get(0).getRating()).isEqualTo(5);

        List<VacancyFeedbackResponse> otherFeedbacks = vacancyFeedbackService.getAllFeedback(otherUser.getId());
        assertThat(otherFeedbacks).hasSize(1);
        assertThat(otherFeedbacks.get(0).getRating()).isEqualTo(1);
    }

    @Test
    void getAllFeedback_ResponseFieldsShouldBePopulated() {
        vacancyFeedbackService.saveFeedback(userId, testVacancy.getId(), true, 3);

        List<VacancyFeedbackResponse> feedbacks = vacancyFeedbackService.getAllFeedback(userId);

        assertThat(feedbacks).hasSize(1);
        VacancyFeedbackResponse resp = feedbacks.get(0);
        assertThat(resp.getId()).isNotNull();
        assertThat(resp.getVacancyId()).isEqualTo(testVacancy.getId());
        assertThat(resp.isLikedMatching()).isTrue();
        assertThat(resp.getRating()).isEqualTo(3);
        assertThat(resp.getCreatedAt()).isNotNull();
    }
}

