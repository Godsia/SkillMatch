package com.skillmatch.backend.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillmatch.backend.user.dto.SetPreferencesRequest;
import com.skillmatch.backend.user.dto.SetSkillsRequest;
import com.skillmatch.backend.user.model.*;
import com.skillmatch.backend.user.repo.*;
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

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@Testcontainers
@ActiveProfiles("test")
class ProfileControllerIT {

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
    private SkillRepository skillRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    @Autowired
    private UserPreferencesRepository userPreferencesRepository;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .findAndRegisterModules();

    private User testUser;

    @BeforeEach
    void setUp() {
        userPreferencesRepository.deleteAll();
        userSkillRepository.deleteAll();

        testUser = new User();
        testUser.setEmail("profile_test@example.com");
        testUser.setPasswordHash("hashed");
        testUser.setFirstName("Anna");
        testUser.setLastName("Smirnova");
        testUser.setGender(Gender.FEMALE);
        testUser.setBirthDate(LocalDate.of(1998, 3, 20));
        testUser.setStatus(UserStatus.ACTIVE);
        testUser = userRepository.save(testUser);
    }

    private Authentication auth() {
        return new UsernamePasswordAuthenticationToken(
                testUser.getId(), null, Collections.emptyList());
    }

    // ── GET /profile/me ───────────────────────────────────────────────

    @Test
    void me_ShouldReturnUserProfile() throws Exception {
        mockMvc.perform(get("/profile/me")
                        .with(authentication(auth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                .andExpect(jsonPath("$.email").value("profile_test@example.com"))
                .andExpect(jsonPath("$.firstName").value("Anna"))
                .andExpect(jsonPath("$.lastName").value("Smirnova"))
                .andExpect(jsonPath("$.gender").value("FEMALE"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.skills").isArray())
                .andExpect(jsonPath("$.skills").isEmpty());
    }

    @Test
    void me_WithSkills_ShouldReturnSkillNames() throws Exception {
        Skill java = new Skill();
        java.setName("Java");
        java = skillRepository.save(java);

        Skill spring = new Skill();
        spring.setName("Spring");
        spring = skillRepository.save(spring);

        UserSkill us1 = new UserSkill();
        us1.setUserId(testUser.getId());
        us1.setSkillId(java.getId());
        userSkillRepository.save(us1);

        UserSkill us2 = new UserSkill();
        us2.setUserId(testUser.getId());
        us2.setSkillId(spring.getId());
        userSkillRepository.save(us2);

        mockMvc.perform(get("/profile/me")
                        .with(authentication(auth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.skills").isArray())
                .andExpect(jsonPath("$.skills.length()").value(2));
    }

    @Test
    void me_WithPreferences_ShouldReturnPreferences() throws Exception {
        UserPreferences prefs = new UserPreferences();
        prefs.setUserId(testUser.getId());
        prefs.setWorkFormats("remote,hybrid");
        prefs.setExperienceLevel("middle");
        prefs.setSalaryFrom(100000);
        prefs.setSalaryTo(200000);
        prefs.setSalaryPeriod("month");
        userPreferencesRepository.save(prefs);

        mockMvc.perform(get("/profile/me")
                        .with(authentication(auth())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferences").isNotEmpty())
                .andExpect(jsonPath("$.preferences.workFormats").value("remote,hybrid"))
                .andExpect(jsonPath("$.preferences.experienceLevel").value("middle"))
                .andExpect(jsonPath("$.preferences.salaryFrom").value(100000))
                .andExpect(jsonPath("$.preferences.salaryTo").value(200000));
    }

    @Test
    void me_Unauthenticated_ShouldReturn401or403() throws Exception {
        mockMvc.perform(get("/profile/me"))
                .andExpect(status().isForbidden());
    }

    // ── PUT /profile/skills ───────────────────────────────────────────

    @Test
    void setSkills_WithCustomSkills_ShouldCreateAndAssign() throws Exception {
        SetSkillsRequest req = new SetSkillsRequest(List.of(
                new SetSkillsRequest.SkillItem(null, "Kotlin"),
                new SetSkillsRequest.SkillItem(null, "Docker")
        ));

        mockMvc.perform(put("/profile/skills")
                        .with(authentication(auth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        List<UserSkill> skills = userSkillRepository.findAllByUserId(testUser.getId());
        assertThat(skills).hasSize(2);

        assertThat(skillRepository.findByNameIgnoreCase("Kotlin")).isPresent();
        assertThat(skillRepository.findByNameIgnoreCase("Docker")).isPresent();
    }

    @Test
    void setSkills_WithExistingSkillId_ShouldAssign() throws Exception {
        Skill existing = new Skill();
        existing.setName("Python");
        existing = skillRepository.save(existing);

        SetSkillsRequest req = new SetSkillsRequest(List.of(
                new SetSkillsRequest.SkillItem(existing.getId(), null)
        ));

        mockMvc.perform(put("/profile/skills")
                        .with(authentication(auth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        List<UserSkill> skills = userSkillRepository.findAllByUserId(testUser.getId());
        assertThat(skills).hasSize(1);
        assertThat(skills.get(0).getSkillId()).isEqualTo(existing.getId());
    }

    @Test
    void setSkills_ReplacePrevious_ShouldRemoveOldOnes() throws Exception {
        // Сначала назначаем Java
        Skill java = new Skill();
        java.setName("Java");
        java = skillRepository.save(java);

        UserSkill us = new UserSkill();
        us.setUserId(testUser.getId());
        us.setSkillId(java.getId());
        userSkillRepository.save(us);

        // Теперь заменяем на Go
        SetSkillsRequest req = new SetSkillsRequest(List.of(
                new SetSkillsRequest.SkillItem(null, "Go")
        ));

        mockMvc.perform(put("/profile/skills")
                        .with(authentication(auth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        List<UserSkill> skills = userSkillRepository.findAllByUserId(testUser.getId());
        assertThat(skills).hasSize(1);

        Skill go = skillRepository.findByNameIgnoreCase("Go").orElseThrow();
        assertThat(skills.get(0).getSkillId()).isEqualTo(go.getId());
    }

    // ── PUT /profile/preferences ──────────────────────────────────────

    @Test
    void setPreferences_ShouldSaveAndActivateUser() throws Exception {
        // Пользователь с EMAIL_CONFIRMED статусом
        testUser.setStatus(UserStatus.EMAIL_CONFIRMED);
        testUser = userRepository.save(testUser);

        SetPreferencesRequest req = new SetPreferencesRequest(
                "remote", "senior", 150000, 300000, "month"
        );

        mockMvc.perform(put("/profile/preferences")
                        .with(authentication(auth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        UserPreferences saved = userPreferencesRepository.findById(testUser.getId()).orElseThrow();
        assertThat(saved.getWorkFormats()).isEqualTo("remote");
        assertThat(saved.getExperienceLevel()).isEqualTo("senior");
        assertThat(saved.getSalaryFrom()).isEqualTo(150000);
        assertThat(saved.getSalaryTo()).isEqualTo(300000);

        User updated = userRepository.findById(testUser.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    void setPreferences_UpdateExisting_ShouldOverwrite() throws Exception {
        // Создаём начальные предпочтения
        UserPreferences prefs = new UserPreferences();
        prefs.setUserId(testUser.getId());
        prefs.setWorkFormats("office");
        prefs.setExperienceLevel("junior");
        prefs.setSalaryFrom(50000);
        prefs.setSalaryTo(80000);
        prefs.setSalaryPeriod("month");
        userPreferencesRepository.save(prefs);

        // Обновляем
        SetPreferencesRequest req = new SetPreferencesRequest(
                "hybrid", "middle", 100000, 180000, "month"
        );

        mockMvc.perform(put("/profile/preferences")
                        .with(authentication(auth()))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        UserPreferences updated = userPreferencesRepository.findById(testUser.getId()).orElseThrow();
        assertThat(updated.getWorkFormats()).isEqualTo("hybrid");
        assertThat(updated.getExperienceLevel()).isEqualTo("middle");
        assertThat(updated.getSalaryFrom()).isEqualTo(100000);
    }
}

