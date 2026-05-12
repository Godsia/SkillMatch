package com.skillmatch.backend.vacancy;

import com.skillmatch.backend.user.model.Skill;
import com.skillmatch.backend.user.model.User;
import com.skillmatch.backend.user.model.UserSkill;
import com.skillmatch.backend.user.model.UserStatus;
import com.skillmatch.backend.user.repo.SkillRepository;
import com.skillmatch.backend.user.repo.UserRepository;
import com.skillmatch.backend.user.repo.UserSkillRepository;
import com.skillmatch.backend.vacancy.dto.VacancyMatchResponse;
import com.skillmatch.backend.vacancy.model.UserVacancyLike;
import com.skillmatch.backend.vacancy.model.Vacancy;
import com.skillmatch.backend.vacancy.repo.UserVacancyLikeRepository;
import com.skillmatch.backend.vacancy.repo.VacancyRepository;
import com.skillmatch.backend.vacancy.service.VacancyMatchService;
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

import java.time.Instant;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@Testcontainers
@ActiveProfiles("test")
class VacancyMatchServiceIT {

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
    private VacancyMatchService vacancyMatchService;

    @Autowired
    private VacancyRepository vacancyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private UserVacancyLikeRepository userVacancyLikeRepository;

    private Long userId;
    private Skill javaSkill;
    private Skill springSkill;
    private Skill pythonSkill;

    @BeforeEach
    void setUp() {
        userVacancyLikeRepository.deleteAll();
        vacancyRepository.deleteAll();
        userSkillRepository.deleteAll();

        User user = new User();
        user.setEmail("match_test@example.com");
        user.setPasswordHash("hashed");
        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.save(user);
        userId = user.getId();

        javaSkill = new Skill();
        javaSkill.setName("Java");
        javaSkill = skillRepository.save(javaSkill);

        springSkill = new Skill();
        springSkill.setName("Spring");
        springSkill = skillRepository.save(springSkill);

        pythonSkill = new Skill();
        pythonSkill.setName("Python");
        pythonSkill = skillRepository.save(pythonSkill);

        addUserSkill(userId, javaSkill.getId());
        addUserSkill(userId, springSkill.getId());
    }

    private void addUserSkill(Long userId, Long skillId) {
        UserSkill us = new UserSkill();
        us.setUserId(userId);
        us.setSkillId(skillId);
        userSkillRepository.save(us);
    }

    private Vacancy createVacancy(String title, String sourceId, Set<Skill> skills, Instant publishedAt) {
        Vacancy v = Vacancy.builder()
                .source("hh.ru")
                .sourceVacancyId(sourceId)
                .title(title)
                .description(title)
                .descriptionPlain(title)
                .url("http://example.com/" + sourceId)
                .employerName("TestCorp")
                .publishedAt(publishedAt)
                .skills(skills)
                .build();
        return vacancyRepository.save(v);
    }

    @Test
    void listMatches_ShouldReturnAllVacancies_WhenNoInteractions() {
        createVacancy("Java Dev", "m-001", Set.of(javaSkill, springSkill), Instant.now());
        createVacancy("Python Dev", "m-002", Set.of(pythonSkill), Instant.now());

        List<VacancyMatchResponse> matches = vacancyMatchService.listMatchesForUser(userId);

        assertThat(matches).hasSize(2);
    }

    @Test
    void listMatches_ShouldSortByMatchPercentDescending() {
        createVacancy("Full match", "m-003",
                Set.of(javaSkill, springSkill), Instant.now());
        createVacancy("No match", "m-004",
                Set.of(pythonSkill), Instant.now());
        createVacancy("Partial match", "m-005",
                Set.of(javaSkill, pythonSkill), Instant.now());

        List<VacancyMatchResponse> matches = vacancyMatchService.listMatchesForUser(userId);

        assertThat(matches).hasSize(3);
        assertThat(matches.get(0).getMatchPercent()).isEqualTo(100.0);
        assertThat(matches.get(1).getMatchPercent()).isEqualTo(50.0);
        assertThat(matches.get(2).getMatchPercent()).isEqualTo(0.0);
    }

    @Test
    void listMatches_ShouldCalculateMatchPercentCorrectly() {
        createVacancy("2 of 3", "m-006",
                Set.of(javaSkill, springSkill, pythonSkill), Instant.now());

        List<VacancyMatchResponse> matches = vacancyMatchService.listMatchesForUser(userId);

        assertThat(matches).hasSize(1);
        double expected = 100.0 * 2 / 3;
        assertThat(matches.get(0).getMatchPercent()).isCloseTo(expected, org.assertj.core.data.Offset.offset(0.01));
    }

    @Test
    void listMatches_ShouldExcludeInteractedVacancies() {
        Vacancy liked = createVacancy("Liked", "m-007", Set.of(javaSkill), Instant.now());
        createVacancy("Unseen", "m-008", Set.of(pythonSkill), Instant.now());

        UserVacancyLike like = UserVacancyLike.builder()
                .userId(userId)
                .vacancyId(liked.getId())
                .liked(true)
                .build();
        userVacancyLikeRepository.save(like);

        List<VacancyMatchResponse> matches = vacancyMatchService.listMatchesForUser(userId);

        assertThat(matches).hasSize(1);
        assertThat(matches.get(0).getTitle()).isEqualTo("Unseen");
    }

    @Test
    void listMatches_VacancyWithNoSkills_ShouldHaveZeroPercent() {
        createVacancy("No skills", "m-009", Set.of(), Instant.now());

        List<VacancyMatchResponse> matches = vacancyMatchService.listMatchesForUser(userId);

        assertThat(matches).hasSize(1);
        assertThat(matches.get(0).getMatchPercent()).isEqualTo(0.0);
    }

    @Test
    void listLiked_ShouldReturnOnlyLikedVacancies() {
        Vacancy v1 = createVacancy("Liked", "ml-001", Set.of(javaSkill), Instant.now());
        Vacancy v2 = createVacancy("Disliked", "ml-002", Set.of(pythonSkill), Instant.now());

        userVacancyLikeRepository.save(UserVacancyLike.builder()
                .userId(userId).vacancyId(v1.getId()).liked(true).build());
        userVacancyLikeRepository.save(UserVacancyLike.builder()
                .userId(userId).vacancyId(v2.getId()).liked(false).build());

        List<VacancyMatchResponse> liked = vacancyMatchService.listLikedForUser(userId);

        assertThat(liked).hasSize(1);
        assertThat(liked.get(0).getTitle()).isEqualTo("Liked");
        assertThat(liked.get(0).isLiked()).isTrue();
    }

    @Test
    void listLiked_Empty_ShouldReturnEmptyList() {
        List<VacancyMatchResponse> liked = vacancyMatchService.listLikedForUser(userId);
        assertThat(liked).isEmpty();
    }


    @Test
    void listDisliked_ShouldReturnOnlyDislikedVacancies() {
        Vacancy v1 = createVacancy("Liked", "md-001", Set.of(javaSkill), Instant.now());
        Vacancy v2 = createVacancy("Disliked", "md-002", Set.of(pythonSkill), Instant.now());

        userVacancyLikeRepository.save(UserVacancyLike.builder()
                .userId(userId).vacancyId(v1.getId()).liked(true).build());
        userVacancyLikeRepository.save(UserVacancyLike.builder()
                .userId(userId).vacancyId(v2.getId()).liked(false).build());

        List<VacancyMatchResponse> disliked = vacancyMatchService.listDislikedForUser(userId);

        assertThat(disliked).hasSize(1);
        assertThat(disliked.get(0).getTitle()).isEqualTo("Disliked");
    }

    @Test
    void listDisliked_Empty_ShouldReturnEmptyList() {
        List<VacancyMatchResponse> disliked = vacancyMatchService.listDislikedForUser(userId);
        assertThat(disliked).isEmpty();
    }
}


