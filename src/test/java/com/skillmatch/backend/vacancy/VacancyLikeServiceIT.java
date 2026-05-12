package com.skillmatch.backend.vacancy;

import com.skillmatch.backend.config.ApiException;
import com.skillmatch.backend.user.model.User;
import com.skillmatch.backend.user.model.UserStatus;
import com.skillmatch.backend.user.repo.UserRepository;
import com.skillmatch.backend.vacancy.model.UserVacancyLike;
import com.skillmatch.backend.vacancy.model.Vacancy;
import com.skillmatch.backend.vacancy.repo.UserVacancyLikeRepository;
import com.skillmatch.backend.vacancy.repo.VacancyRepository;
import com.skillmatch.backend.vacancy.service.VacancyLikeService;
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

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
@Testcontainers
@ActiveProfiles("test")
class VacancyLikeServiceIT {

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
    private VacancyLikeService vacancyLikeService;

    @Autowired
    private VacancyRepository vacancyRepository;

    @Autowired
    private UserVacancyLikeRepository userVacancyLikeRepository;

    @Autowired
    private UserRepository userRepository;

    private Long userId;
    private Vacancy testVacancy;

    @BeforeEach
    void setUp() {
        userVacancyLikeRepository.deleteAll();
        vacancyRepository.deleteAll();

        User user = new User();
        user.setEmail("like_test@example.com");
        user.setPasswordHash("hashed");
        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.save(user);
        userId = user.getId();

        testVacancy = Vacancy.builder()
                .source("hh.ru")
                .sourceVacancyId("lk-001")
                .title("Test Vacancy")
                .description("desc")
                .descriptionPlain("desc")
                .url("http://example.com/lk-001")
                .employerName("Corp")
                .build();
        testVacancy = vacancyRepository.save(testVacancy);
    }

    @Test
    void setLike_ShouldCreateNewLikeRecord() {
        vacancyLikeService.setLike(userId, testVacancy.getId(), true);

        Optional<UserVacancyLike> like = userVacancyLikeRepository
                .findByUserIdAndVacancyId(userId, testVacancy.getId());

        assertThat(like).isPresent();
        assertThat(like.get().isLiked()).isTrue();
        assertThat(like.get().getCreatedAt()).isNotNull();
        assertThat(like.get().getUpdatedAt()).isNotNull();
    }

    @Test
    void setLike_ShouldCreateDislikeRecord() {
        vacancyLikeService.setLike(userId, testVacancy.getId(), false);

        Optional<UserVacancyLike> like = userVacancyLikeRepository
                .findByUserIdAndVacancyId(userId, testVacancy.getId());

        assertThat(like).isPresent();
        assertThat(like.get().isLiked()).isFalse();
    }

    @Test
    void setLike_ChangeLikeToDislike_ShouldUpdate() {
        vacancyLikeService.setLike(userId, testVacancy.getId(), true);

        UserVacancyLike original = userVacancyLikeRepository
                .findByUserIdAndVacancyId(userId, testVacancy.getId()).orElseThrow();
        assertThat(original.isLiked()).isTrue();

        vacancyLikeService.setLike(userId, testVacancy.getId(), false);

        UserVacancyLike updated = userVacancyLikeRepository
                .findByUserIdAndVacancyId(userId, testVacancy.getId()).orElseThrow();
        assertThat(updated.isLiked()).isFalse();
        assertThat(updated.getId()).isEqualTo(original.getId());
    }

    @Test
    void setLike_ChangeDislikeToLike_ShouldUpdate() {
        vacancyLikeService.setLike(userId, testVacancy.getId(), false);
        vacancyLikeService.setLike(userId, testVacancy.getId(), true);

        UserVacancyLike updated = userVacancyLikeRepository
                .findByUserIdAndVacancyId(userId, testVacancy.getId()).orElseThrow();
        assertThat(updated.isLiked()).isTrue();
    }

    @Test
    void setLike_NonExistentVacancy_ShouldThrowApiException() {
        assertThatThrownBy(() -> vacancyLikeService.setLike(userId, 999999L, true))
                .isInstanceOf(ApiException.class)
                .hasMessage("Vacancy not found");
    }

    @Test
    void setLike_MultipleVacancies_ShouldTrackSeparately() {
        Vacancy v2 = Vacancy.builder()
                .source("hh.ru")
                .sourceVacancyId("lk-002")
                .title("Second Vacancy")
                .description("desc2")
                .descriptionPlain("desc2")
                .url("http://example.com/lk-002")
                .employerName("Corp2")
                .build();
        v2 = vacancyRepository.save(v2);

        vacancyLikeService.setLike(userId, testVacancy.getId(), true);
        vacancyLikeService.setLike(userId, v2.getId(), false);

        assertThat(userVacancyLikeRepository.findLikedVacancyIds(userId)).containsExactly(testVacancy.getId());
        assertThat(userVacancyLikeRepository.findDislikedVacancyIds(userId)).containsExactly(v2.getId());
    }

    @Test
    void setLike_DifferentUsers_ShouldBeIndependent() {
        User user2 = new User();
        user2.setEmail("like_test2@example.com");
        user2.setPasswordHash("hashed");
        user2.setStatus(UserStatus.ACTIVE);
        user2 = userRepository.save(user2);

        vacancyLikeService.setLike(userId, testVacancy.getId(), true);
        vacancyLikeService.setLike(user2.getId(), testVacancy.getId(), false);

        UserVacancyLike like1 = userVacancyLikeRepository
                .findByUserIdAndVacancyId(userId, testVacancy.getId()).orElseThrow();
        UserVacancyLike like2 = userVacancyLikeRepository
                .findByUserIdAndVacancyId(user2.getId(), testVacancy.getId()).orElseThrow();

        assertThat(like1.isLiked()).isTrue();
        assertThat(like2.isLiked()).isFalse();
    }
}

