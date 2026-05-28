package com.skillmatch.backend.vacancy.service;

import com.skillmatch.backend.user.repo.UserSkillRepository;
import com.skillmatch.backend.user.repo.UserPreferencesRepository;
import com.skillmatch.backend.user.model.UserPreferences;
import com.skillmatch.backend.vacancy.dto.VacancyMatchResponse;
import com.skillmatch.backend.vacancy.model.Vacancy;
import com.skillmatch.backend.vacancy.repo.VacancyMatchProjection;
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

    public long countMatchesForUser(Long userId) {
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
                    "projectinformation", "side_job,project",
                    "internship", "probation"
            );
            String[] parts = prefs.getEmploymentTypes().split(",");
            for (String part : parts) {
                String val = empMap.get(part.trim().toLowerCase());
                if (val != null) {
                    for (String v : val.split(",")) {
                        targetEmploymentTypes.add(v);
                    }
                }
            }
        }

        Set<String> targetWorkFormats = new HashSet<>();
        if (prefs != null && prefs.getWorkFormats() != null && !prefs.getWorkFormats().isBlank()) {
            Map<String, String> wfMap = Map.of(
                    "standart", "ON_SITE",
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

        List<Long> interactedIds = userVacancyLikeRepository.findInteractedVacancyIds(userId);

        List<VacancyMatchProjection> projections = interactedIds.isEmpty()
                ? vacancyRepository.findAllVacancyMatchInfo()
                : vacancyRepository.findVacancyMatchInfoNotIn(interactedIds);

        class VInfo {
            String experienceLevel;
            Integer salaryFrom;
            Integer salaryTo;
            String employmentType;
            String workFormat;
            String workSchedule;
            int totalSkills = 0;
            int overlap = 0;
        }

        Map<Long, VInfo> map = new HashMap<>();
        for (var p : projections) {
            VInfo info = map.computeIfAbsent(p.getId(), k -> {
                VInfo i = new VInfo();
                i.experienceLevel = p.getExperienceLevel();
                i.salaryFrom = p.getSalaryFrom();
                i.salaryTo = p.getSalaryTo();
                i.employmentType = p.getEmploymentType();
                i.workFormat = p.getWorkFormat();
                i.workSchedule = p.getWorkSchedule();
                return i;
            });

            if (p.getSkillId() != null) {
                info.totalSkills++;
                if (userSkillIds.contains(p.getSkillId())) {
                    info.overlap++;
                }
            }
        }

        long count = 0;

        for (VInfo v : map.values()) {
            if (targetHhExp != null) {
                if (!targetHhExp.equals(v.experienceLevel)) {
                    continue;
                }
            }

            if (reqSalFrom > 0 || reqSalTo < Integer.MAX_VALUE) {
                int vacSalFrom = (v.salaryFrom != null) ? v.salaryFrom : 0;
                int vacSalTo = (v.salaryTo != null && v.salaryTo > 0) ? v.salaryTo : Integer.MAX_VALUE;

                int maxFrom = Math.max(reqSalFrom, vacSalFrom);
                int minTo = Math.min(reqSalTo, vacSalTo);

                if (maxFrom > minTo) {
                    continue;
                }
            }

            if (!targetEmploymentTypes.isEmpty() && v.employmentType != null) {
                String[] vacEmpTypes = v.employmentType.toLowerCase().split(",");
                boolean match = false;
                for (String vet : vacEmpTypes) {
                    if (targetEmploymentTypes.contains(vet.trim())) {
                        match = true;
                        break;
                    }
                }
                if (!match) {
                    continue;
                }
            }

            if (!targetWorkFormats.isEmpty()) {
                boolean match = false;
                if (v.workFormat != null) {
                    String[] vacWorkFormats = v.workFormat.split(",");
                    for (String vwf : vacWorkFormats) {
                        for (String twf : targetWorkFormats) {
                            if (vwf.trim().equalsIgnoreCase(twf)) {
                                match = true;
                                break;
                            }
                        }
                        if (match) break;
                    }
                }
                if (!match && v.workSchedule != null) {
                    String[] vacWorkSchedules = v.workSchedule.split(",");
                    for (String vws : vacWorkSchedules) {
                        for (String twf : targetWorkFormats) {
                            if (vws.trim().equalsIgnoreCase(twf)) {
                                match = true;
                                break;
                            }
                        }
                        if (match) break;
                    }
                }
                if (!match) continue;
            }

            double matchPercent = (v.totalSkills == 0) ? 0.0 : (100.0 * v.overlap / (double) v.totalSkills);
            if (matchPercent >= 50.0) {
                count++;
            }
        }
        return count;
    }

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
                    "projectinformation", "side_job,project",
                    "internship", "probation"
            );
            String[] parts = prefs.getEmploymentTypes().split(",");
            for (String part : parts) {
                String val = empMap.get(part.trim().toLowerCase());
                if (val != null) {
                    for (String v : val.split(",")) {
                        targetEmploymentTypes.add(v);
                    }
                }
            }
        }

        Set<String> targetWorkFormats = new HashSet<>();
        if (prefs != null && prefs.getWorkFormats() != null && !prefs.getWorkFormats().isBlank()) {
            Map<String, String> wfMap = Map.of(
                    "standart", "ON_SITE",
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
                String[] vacEmpTypes = v.getEmploymentType().toLowerCase().split(",");
                boolean match = false;
                for (String vet : vacEmpTypes) {
                    if (targetEmploymentTypes.contains(vet.trim())) {
                        match = true;
                        break;
                    }
                }
                if (!match) {
                    continue;
                }
            }

            if (!targetWorkFormats.isEmpty()) {
                boolean match = false;
                if (v.getWorkFormat() != null) {
                    String[] vacWorkFormats = v.getWorkFormat().split(",");
                    for (String vwf : vacWorkFormats) {
                        for (String twf : targetWorkFormats) {
                            if (vwf.trim().equalsIgnoreCase(twf)) {
                                match = true;
                                break;
                            }
                        }
                        if (match) break;
                    }
                }
                if (!match && v.getWorkSchedule() != null) {
                    String[] vacWorkSchedules = v.getWorkSchedule().split(",");
                    for (String vws : vacWorkSchedules) {
                        for (String twf : targetWorkFormats) {
                            if (vws.trim().equalsIgnoreCase(twf)) {
                                match = true;
                                break;
                            }
                        }
                        if (match) break;
                    }
                }
                if (!match) continue;
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
