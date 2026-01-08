package com.skillmatch.backend.user.service;

import com.skillmatch.backend.config.ApiException;
import com.skillmatch.backend.user.dto.*;
import com.skillmatch.backend.user.model.*;
import com.skillmatch.backend.user.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserPreferencesRepository userPreferencesRepository;

    public MeResponse me(Long userId) {
        User u = userRepository.findById(userId).orElseThrow(() -> new ApiException("User not found"));

        List<UserSkill> us = userSkillRepository.findAllByUserId(userId);
        List<String> skillNames = us.stream()
                .map(x -> skillRepository.findById(x.getSkillId()).map(Skill::getName).orElse("unknown"))
                .toList();

        UserPreferences prefs = userPreferencesRepository.findById(userId).orElse(null);
        PreferencesDto prefsDto = prefs == null ? null : new PreferencesDto(
                prefs.getWorkFormats(),
                prefs.getExperienceLevel(),
                prefs.getSalaryFrom(),
                prefs.getSalaryTo(),
                prefs.getSalaryPeriod()
        );

        return new MeResponse(
                u.getId(), u.getEmail(), u.getFirstName(), u.getLastName(),
                u.getGender(), u.getBirthDate(), u.getStatus(),
                skillNames, prefsDto
        );
    }

    @Transactional
    public void setSkills(Long userId, SetSkillsRequest req) {
        User u = userRepository.findById(userId).orElseThrow(() -> new ApiException("User not found"));

        userSkillRepository.deleteAllByUserId(userId);

        for (SetSkillsRequest.SkillItem item : req.skills()) {
            Long skillId = item.skillId();

            if (skillId == null) {
                String name = (item.customSkill() == null || item.customSkill().isBlank())
                        ? null : item.customSkill().trim();
                if (name == null) throw new ApiException("skillId or customSkill required");

                Skill s = skillRepository.findByNameIgnoreCase(name).orElseGet(() -> {
                    Skill created = new Skill();
                    created.setName(name);
                    return skillRepository.save(created);
                });
                skillId = s.getId();
            }

            UserSkill us = new UserSkill();
            us.setUserId(userId);
            us.setSkillId(skillId);
            userSkillRepository.save(us);
        }

        if (u.getStatus() == UserStatus.EMAIL_CONFIRMED) {
            u.setStatus(UserStatus.EMAIL_CONFIRMED);
            userRepository.save(u);
        }
    }

    public void setPreferences(Long userId, SetPreferencesRequest req) {
        User u = userRepository.findById(userId).orElseThrow(() -> new ApiException("User not found"));

        UserPreferences p = userPreferencesRepository.findById(userId).orElse(new UserPreferences());
        p.setUserId(userId);
        p.setWorkFormats(req.workFormats());
        p.setExperienceLevel(req.experienceLevel());
        p.setSalaryFrom(req.salaryFrom());
        p.setSalaryTo(req.salaryTo());
        p.setSalaryPeriod(req.salaryPeriod());
        userPreferencesRepository.save(p);

        u.setStatus(UserStatus.ACTIVE);
        userRepository.save(u);
    }
}
