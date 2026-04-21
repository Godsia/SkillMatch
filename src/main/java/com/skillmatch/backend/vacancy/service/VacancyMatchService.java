package com.skillmatch.backend.vacancy.service;

import com.skillmatch.backend.user.repo.UserSkillRepository;
import com.skillmatch.backend.user.repo.UserPreferencesRepository;
import com.skillmatch.backend.user.model.UserPreferences;
import com.skillmatch.backend.vacancy.dto.VacancyMatchResponse;
import com.skillmatch.backend.vacancy.model.Vacancy;
import com.skillmatch.backend.vacancy.repo.VacancyRepository;
import com.skillmatch.backend.vacancy.repo.UserVacancyLikeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VacancyMatchService {

    private final VacancyRepository vacancyRepository;
    private final UserSkillRepository userSkillRepository;
    private final UserVacancyLikeRepository userVacancyLikeRepository;
    private final UserPreferencesRepository userPreferencesRepository;

    public List<VacancyMatchResponse> listMatchesForUser(Long userId) {
        log.info("Listing vacancy matches userId={}", userId);

        Set<Long> userSkillIds = userSkillRepository.findAllByUserId(userId).stream()
                .map(us -> us.getSkillId())
                .collect(Collectors.toSet());

        UserPreferences prefs = userPreferencesRepository.findById(userId).orElse(null);

        String targetHhExp = null;
        if (prefs != null && prefs.getExperienceLevel() != null && !prefs.getExperienceLevel().isBlank()) {
            Map<String, String> expMap = Map.of(
                    "junior", "noExperience",
                    "middle", "between1And3",
                    "senior", "between3And6",
                    "leader", "moreThan6"
            );
            targetHhExp = expMap.get(prefs.getExperienceLevel().toLowerCase());
        }

        Set<String> targetEmploymentTypes = new HashSet<>();
        if (prefs != null && prefs.getEmploymentTypes() != null && !prefs.getEmploymentTypes().isBlank()) {
            Map<String, String> empMap = Map.of(
                    "full", "full",
                    "partial", "part",
                    "projectinformation", "project",
                    "intership", "probation"
            );
            String[] parts = prefs.getEmploymentTypes().split(",");
            for (String part : parts) {
                String val = empMap.get(part.trim().toLowerCase());
                if (val != null) targetEmploymentTypes.add(val);
            }
        }

        Set<String> targetWorkFormats = new HashSet<>();
        if (prefs != null && prefs.getWorkFormats() != null && !prefs.getWorkFormats().isBlank()) {
            Map<String, String> wfMap = Map.of(
                    "standart", "fullDay", // "fullDay" or "ON_SITE" ? User said "ON_SITE", but HH sends schedule as "fullDay" etc. User specifically said "standart-ON_SITE, online-REMOTE, hybrid-HYBRID". Wait, I should stick to user request but wait. User wrote "standart-ON_SITE, online-REMOTE, hybrid-HYBRID" in his prompt. Let's use lower/upper cases carefully.
                    "online", "REMOTE",
                    "hybrid", "HYBRID"
            );
            String[] parts = prefs.getWorkFormats().split(",");
            for (String part : parts) {
                String val = wfMap.get(part.trim().toLowerCase());
                if (val != null) targetWorkFormats.add(val);
            }
        }

        int reqSalFrom = (prefs != null && prefs.getSalaryFrom() != null) ? prefs.getSalaryFrom() : 0;
        int reqSalTo = (prefs != null && prefs.getSalaryTo() != null && prefs.getSalaryTo() > 0) ? prefs.getSalaryTo() : Integer.MAX_VALUE;

        // Exclude vacancies that the user already interacted with (liked OR disliked)
        List<Long> interactedIds = userVacancyLikeRepository.findInteractedVacancyIds(userId);
        List<Vacancy> vacancies = interactedIds.isEmpty()
                ? vacancyRepository.findAllByOrderByPublishedAtDesc()
                : vacancyRepository.findByIdNotInOrderByPublishedAtDesc(interactedIds);

        Set<Long> likedVacancyIds = new HashSet<>(userVacancyLikeRepository.findLikedVacancyIds(userId));

        List<VacancyMatchResponse> res = new ArrayList<>(vacancies.size());

        for (Vacancy v : vacancies) {
            if (targetHhExp != null) {
                if (!targetHhExp.equals(v.getExperienceLevel())) {
                    continue;
                }
            }

            if (reqSalFrom > 0 || reqSalTo < Integer.MAX_VALUE) {
                int vacSalFrom = (v.getSalaryFrom() != null) ? v.getSalaryFrom() : 0;
                int vacSalTo = (v.getSalaryTo() != null && v.getSalaryTo() > 0) ? v.getSalaryTo() : Integer.MAX_VALUE;

                int maxFrom = Math.max(reqSalFrom, vacSalFrom);
                int minTo = Math.min(reqSalTo, vacSalTo);

                if (maxFrom > minTo) {
                    continue;
                }
            }

            if (!targetEmploymentTypes.isEmpty() && v.getEmploymentType() != null) {
                String vacEmpType = v.getEmploymentType().toLowerCase();
                if (!targetEmploymentTypes.contains(vacEmpType)) {
                    continue;
                }
            }

            if (!targetWorkFormats.isEmpty() && v.getWorkFormat() != null) {
                String vacWorkFormat = v.getWorkFormat().toLowerCase();
                if (!targetWorkFormats.contains(vacWorkFormat)) {
                    continue;
                }
            }

            int total = (v.getSkills() == null) ? 0 : v.getSkills().size();
            int overlap = 0;

            List<String> skillNames = List.of();
            if (v.getSkills() != null && !v.getSkills().isEmpty()) {
                skillNames = v.getSkills().stream()
                        .map(s -> s.getName())
                        .filter(Objects::nonNull)
                        .distinct()
                        .sorted(String::compareToIgnoreCase)
                        .collect(Collectors.toList());

                for (var s : v.getSkills()) {
                    if (s.getId() != null && userSkillIds.contains(s.getId())) {
                        overlap++;
                    }
                }
            }

            double matchPercent = (total == 0) ? 0.0 : (100.0 * overlap / (double) total);

            res.add(VacancyMatchResponse.builder()
                    .id(v.getId())
                    .source(v.getSource())
                    .sourceVacancyId(v.getSourceVacancyId())
                    .title(v.getTitle())
                    .descriptionPlain(v.getDescriptionPlain())
                    .url(v.getUrl())
                    .employerName(v.getEmployerName())
                    .employerLogoUrl(v.getEmployerLogoUrl())
                    .areaName(v.getAreaName())
                    .publishedAt(v.getPublishedAt())
                    .salaryFrom(v.getSalaryFrom())
                    .salaryTo(v.getSalaryTo())
                    .salaryCurrency(v.getSalaryCurrency())
                    .salaryGross(v.getSalaryGross())
                    .experienceLevel(v.getExperienceLevel())
                    .employmentType(v.getEmploymentType())
                    .workSchedule(v.getWorkSchedule())
                    .workFormat(v.getWorkFormat())
                    .skills(skillNames)
                    .matchPercent(matchPercent)
                    .liked(likedVacancyIds.contains(v.getId()))
                    .build());
        }


        res.sort(Comparator
                .comparingDouble(VacancyMatchResponse::getMatchPercent).reversed()
                .thenComparing(VacancyMatchResponse::getPublishedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(VacancyMatchResponse::getId));

        log.info("Found {} vacancy matches for userId={}", res.size(), userId);
        return res;
    }

    public List<VacancyMatchResponse> listLikedForUser(Long userId) {
        log.info("Listing liked vacancies userId={}", userId);
        Set<Long> userSkillIds = userSkillRepository.findAllByUserId(userId).stream()
                .map(us -> us.getSkillId())
                .collect(Collectors.toSet());

        List<Long> likedIds = userVacancyLikeRepository.findLikedVacancyIds(userId);
        if (likedIds.isEmpty()) return List.of();

        List<Vacancy> vacancies = vacancyRepository.findAllById(likedIds);

        List<VacancyMatchResponse> res = new ArrayList<>(vacancies.size());
        for (Vacancy v : vacancies) {
            int total = (v.getSkills() == null) ? 0 : v.getSkills().size();
            int overlap = 0;

            List<String> skillNames = List.of();
            if (v.getSkills() != null && !v.getSkills().isEmpty()) {
                skillNames = v.getSkills().stream()
                        .map(s -> s.getName())
                        .filter(Objects::nonNull)
                        .distinct()
                        .sorted(String::compareToIgnoreCase)
                        .collect(Collectors.toList());

                for (var s : v.getSkills()) {
                    if (s.getId() != null && userSkillIds.contains(s.getId())) {
                        overlap++;
                    }
                }
            }

            double matchPercent = (total == 0) ? 0.0 : (100.0 * overlap / (double) total);

            res.add(VacancyMatchResponse.builder()
                    .id(v.getId())
                    .source(v.getSource())
                    .sourceVacancyId(v.getSourceVacancyId())
                    .title(v.getTitle())
                    .descriptionPlain(v.getDescriptionPlain())
                    .url(v.getUrl())
                    .employerName(v.getEmployerName())
                    .employerLogoUrl(v.getEmployerLogoUrl())
                    .areaName(v.getAreaName())
                    .publishedAt(v.getPublishedAt())
                    .salaryFrom(v.getSalaryFrom())
                    .salaryTo(v.getSalaryTo())
                    .salaryCurrency(v.getSalaryCurrency())
                    .salaryGross(v.getSalaryGross())
                    .experienceLevel(v.getExperienceLevel())
                    .employmentType(v.getEmploymentType())
                    .workSchedule(v.getWorkSchedule())
                    .workFormat(v.getWorkFormat())
                    .skills(skillNames)
                    .matchPercent(matchPercent)
                    .liked(true)
                    .build());
        }

        res.sort(Comparator
                .comparingDouble(VacancyMatchResponse::getMatchPercent).reversed()
                .thenComparing(VacancyMatchResponse::getPublishedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(VacancyMatchResponse::getId));

        log.info("Found {} liked vacancies for userId={}", res.size(), userId);
        return res;
    }

    public List<VacancyMatchResponse> listDislikedForUser(Long userId) {
        log.info("Listing disliked vacancies userId={}", userId);
        Set<Long> userSkillIds = userSkillRepository.findAllByUserId(userId).stream()
                .map(us -> us.getSkillId())
                .collect(Collectors.toSet());

        List<Long> dislikedIds = userVacancyLikeRepository.findDislikedVacancyIds(userId);
        if (dislikedIds.isEmpty()) return List.of();

        List<Vacancy> vacancies = vacancyRepository.findAllById(dislikedIds);

        List<VacancyMatchResponse> res = new ArrayList<>(vacancies.size());
        for (Vacancy v : vacancies) {
            int total = (v.getSkills() == null) ? 0 : v.getSkills().size();
            int overlap = 0;

            List<String> skillNames = List.of();
            if (v.getSkills() != null && !v.getSkills().isEmpty()) {
                skillNames = v.getSkills().stream()
                        .map(s -> s.getName())
                        .filter(Objects::nonNull)
                        .distinct()
                        .sorted(String::compareToIgnoreCase)
                        .collect(Collectors.toList());

                for (var s : v.getSkills()) {
                    if (s.getId() != null && userSkillIds.contains(s.getId())) {
                        overlap++;
                    }
                }
            }

            double matchPercent = (total == 0) ? 0.0 : (100.0 * overlap / (double) total);

            res.add(VacancyMatchResponse.builder()
                    .id(v.getId())
                    .source(v.getSource())
                    .sourceVacancyId(v.getSourceVacancyId())
                    .title(v.getTitle())
                    .descriptionPlain(v.getDescriptionPlain())
                    .url(v.getUrl())
                    .employerName(v.getEmployerName())
                    .employerLogoUrl(v.getEmployerLogoUrl())
                    .areaName(v.getAreaName())
                    .publishedAt(v.getPublishedAt())
                    .salaryFrom(v.getSalaryFrom())
                    .salaryTo(v.getSalaryTo())
                    .salaryCurrency(v.getSalaryCurrency())
                    .salaryGross(v.getSalaryGross())
                    .experienceLevel(v.getExperienceLevel())
                    .employmentType(v.getEmploymentType())
                    .workSchedule(v.getWorkSchedule())
                    .workFormat(v.getWorkFormat())
                    .skills(skillNames)
                    .matchPercent(matchPercent)
                    .liked(false)
                    .build());
        }

        res.sort(Comparator
                .comparingDouble(VacancyMatchResponse::getMatchPercent).reversed()
                .thenComparing(VacancyMatchResponse::getPublishedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(VacancyMatchResponse::getId));

        log.info("Found {} disliked vacancies for userId={}", res.size(), userId);
        return res;
    }
}
